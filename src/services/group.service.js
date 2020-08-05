const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Return the permissions that a group has.
   * @param {number} groupId 
   * @returns {Promise<Array<object>>}
   *  * name: string
   *  * codename: string
   */
  getGroupPermissions: async function(groupId) {
    let query = `
      select
        gp.name,
        gp.codename
      from permissions_granted_to_groups as pgtg
        inner join group_permissions as gp
          on pgtg.group_permission_id = gp.id
      where pgtg.group_id = ?`
    
    try {
      let permissions = await mariadb.query(query, [groupId])
      let exists_group = true

      if(!permissions.length) {
        query = `select id from user_groups where id = ? limit 1`
        let group = await mariadb.query(query, [groupId])
        if(!group.length) {
          exists_group = false
        }
      }
      
      return {
        exists_group,
        permissions
      }
    } catch(err) {
      err.file = __filename
      err.func = 'getGroupPermissions'
      throw err
    }
  },

  /**
   * Creates a new group associating the userId as owner.
   * @param {int} userId 
   * @param {object} group 
   *  * group_name: string
   *  * image_src: string
   *  * description: string
   *  * visibility: string
   *  * permissions: Array<int>
   *  * tags: Array<string>
   * @returns Object
   *  * exit_code: int
   *  * message: string
   *  * id: int, if exit_code = 0
   */
  createGroup: async function(userId, group) {
    let query = `call group_create(?, ?, ?, ?, ?)` //exit codes: 1, 2.
    let args = [userId, group.group_name, group.image_src || '', group.description, group.visibility]
    let conn

    try {
      conn = await mariadb.getConnection()
      conn.beginTransaction()
      let groupRes = await conn.query(query, args)
      groupRes = groupRes[0][0]
      if(groupRes.exit_code != 0) {
        conn.rollback()
        return groupRes
      }

      query = `call group_grant_permission(?, ?)` //exit code 2 -> 3
      for(let perm of group.permissions) {
        let resGrantPerm = await conn.query(query, [groupRes.id, perm])
        resGrantPerm = resGrantPerm[0][0]
        if(resGrantPerm.exit_code == 2) {
          //client error.
          conn.rollback()
          resGrantPerm.exit_code = 3
          return resGrantPerm
        } else if(resGrantPerm.exit_code == 1) {
          //Internal error.
          let errmsg = 'New group id not provided properly to "group_grant_permission" SP '
                     + 'although it is supposed that the group was successfully created'
          throw new Error(errmsg)
        }
      }

      query = `call group_add_tag(?, ?)`
      for(let tag of group.tags) {
        let resCreateTag = await conn.query(query, [groupRes.id, tag])
        resCreateTag = resCreateTag[0][0]
        if(resCreateTag.exit_code == 1) {
          //Internal error.
          let errmsg = 'New group id not provided properly to "group_add_tag" SP '
                     + 'although it is supposed that the group was successfully created'
          throw new Error(errmsg)
        }
      }

      conn.commit()
      conn.release()

      return groupRes
    } catch(err) {
      conn.rollback()
      err.file = __filename
      err.func = 'createGroup'
      throw err
    }
  }
}
