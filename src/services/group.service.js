const mariadb = require('./mariadb.service')

async function addPermissionToGroup(conn, groupId, permissions) {
  let query = `
  insert into group_tags 
    (group_id, tag)
  values
  `
  try {
    if (!conn) {
      //Internal error.
      let errmsg = 'DB connection was not provided'
      throw new Error(errmsg)
    } if(!groupId) {
      //Internal error.
      let errmsg = 'Group id was not provided'
      throw new Error(errmsg)
    } if(!permissions.length) {
      //Internal error.
      let errmsg = 'No permissions was provided'
      throw new Error(errmsg)
    }
    query += '(?, ?)'
    let args = [groupId, permissions[0]]
    for(let i = 1; i < permissions.length; i++) {
      query += ', (?, ?)'
      args.push(groupId, permissions[i])
    }
    await conn.query(query, args)
  } catch(err) {
    err.func = 'addPermissionToGroup'
    err.file = __filename
    throw err
  }
}

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
   * Perform a search in the database retrieving all the group records that match with 'search' parameter.
   * It gets all public groups or only the groups (public and private) that user belongs to.
   * It can selects chunks of records of 'offset' size. The chunk number is defined by 'page'.
   * It supports ascending and descending order by the group id.
   * @param {string} groupRelativeType 
   * @param {string} search 
   * @param {number} offset 
   * @param {number} page 
   * @param {number} asc 
   * @param {number} userId 
   * 
   * @returns {Object}
   *  * groups: Object. Groups records.
   *  * total_records: number
   */
  searchGroups: async function(groupRelativeType = 'all', search = '', offset = 10, page = 0, asc = 1, userId) {
    let query = `
      SELECT 
        user_groups.name,
        user_groups.image_src,
        user_groups.description
      FROM
        user_groups
          LEFT JOIN
        group_tags ON group_tags.group_id = user_groups.id
    `
    // groupRelativeType = all | user
    if (groupRelativeType == 'all') {
      query += `
      WHERE
        user_groups.visibility = 'public'
      `
    } else if (groupRelativeType == 'user') {
      query += `
          INNER JOIN
        group_memberships ON group_memberships.group_id = user_groups.id
      WHERE
        group_memberships.user_id = ${userId}
      `
    }
    
    query += `
        AND (user_groups.name REGEXP ?
        OR user_groups.description REGEXP ?
        OR group_tags.tag REGEXP ?)
      GROUP BY user_groups.id
      ORDER BY user_groups.id ${asc ? 'ASC' : 'DESC'}
      LIMIT ${offset * page}, ${offset};
    `

    search = search.split(' ').join('|')
    regexpArgs = [search, search, search]

    // Counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 3, 'DISTINCT COUNT(*) OVER () AS total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')
    countQuery += ';'

    try {
      let result = await mariadb.query(query, regexpArgs)
      let countResult = await mariadb.query(countQuery, regexpArgs)
      return {
        groups: result,
        total_records: countResult[0].total_records
      }
    } catch (err) {
      err.file = __filename
      err.func = 'searchGroups'
      throw err
    }
  },

  /** Creates a new group associating the userId as owner.
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

      await addPermissionToGroup(conn, groupRes.id, group.permissions)

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
      err.file = err.file || __filename
      err.func = err.func || 'createGroup'
      throw err
    }
  }
}
