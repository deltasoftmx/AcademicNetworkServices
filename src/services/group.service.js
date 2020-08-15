const cloudinary = require('cloudinary').v2
const mariadb = require('./mariadb.service')
const logService = require('./log.service')

/**
 * Add the permissions in to a certain group, all by id.
 * @param {MariaDBConnection} conn 
 * @param {int} groupId 
 * @param {Array<int>} permissions 
 */
async function addPermissionToGroup(conn, groupId, permissions) {
  let query = `call group_grant_permission(?, ?)`
  
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
      let errmsg = 'At least one permission is required'
      throw new Error(errmsg)
    }
    let res
    for(let perm of permissions) {
      res = await conn.query(query, [groupId, perm])
      res = res[0][0]
      if(res.exit_code != 0) {
        break
      }
    }
    return res
  } catch(err) {
    err.func = 'addPermissionToGroup'
    err.file = __filename
    throw err
  }
}


/**
 * Add tags to a certain group by group id.
 * @param {MariaDBConnection} conn 
 * @param {int} groupId 
 * @param {Array<string>} tags 
 */
async function addTagsToGroup(conn, groupId, tags) {
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
    } if(!tags.length) {
      //Internal error.
      let errmsg = 'At least one tag is required'
      throw new Error(errmsg)
    }
    
    query += '(?, ?)'
    let args = [groupId, tags[0]]
    for(let i = 1; i < tags.length; i++) {
      query += ', (?, ?)'
      args.push(groupId, tags[i])
    }
    return await conn.query(query, args)
  } catch(err) {
    err.func = 'addTagsToGroup'
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
        user_groups.id,
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
    countQuery.splice(2, 4, 'DISTINCT COUNT(*) OVER () AS total_records')
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

      let addPermRes = await addPermissionToGroup(conn, groupRes.id, group.permissions)
      if(addPermRes.exit_code == 1) { //exit code 1 -> 3
        addPermRes.exit_code = 3
        return addPermRes
      }

      await addTagsToGroup(conn, groupRes.id, group.tags)

      conn.commit()
      conn.release()

      return groupRes
    } catch(err) {
      conn.rollback()
      err.file = err.file || __filename
      err.func = err.func || 'createGroup'
      throw err
    }
  },

  /**
   * Turn on or turn off the group notifications which the user requesting belongs to.
   * @param {int} userId 
   * @param {int} group_id 
   * @param {int} state 
   * @returns {Object}
   *  * exit_code: int
   *  * message: string
   */
  switchGroupNotifications: async function(userId, group_id, state) {
    try {
      let query = 'call group_switch_notifications(?, ?, ?);' // exit codes: 1, 2.
      let result = await mariadb.query(query, [userId, group_id, state])
      return result[0][0]
    } catch (err) {
      err.file = __filename
      err.func = 'switchGroupNotifications'
      throw err
    }
  },

  /**
   * Update the group image. To do that the user requesting must be the group owner.
   * @param {int} group_id 
   * @param {Object} image 
   * @param {int} userId 
   * @returns {Object}
   *  * exit_code: int
   *  * image_src: string. Only if exit_code = 0.
   */
  updateGroupImage: async function(group_id, image, userId) {
    let cloudinary_id = undefined

    try {
      let query = `
        select
          owner_user_id,
          cloudinary_id
        from user_groups
        where id = ?
        limit 1;
      `
      let resultQuery = await mariadb.query(query, [group_id])
      resultQuery = resultQuery[0]
      
      // Verify if the group exist and the user requesting is the group owner.
      if (!resultQuery) {
        return {
          exit_code: 1
        }
      } else if (resultQuery.owner_user_id != userId){
        return {
          exit_code: 2
        }
      }

      // If the group currently has an image, then it is deleted from Cloudinary.
      if (resultQuery.cloudinary_id) {
        cloudinary.uploader.destroy(resultQuery.cloudinary_id).catch( err => {
          err.file = __filename
          err.func = 'updateGroupImage'
          err.method = 'PUT'
          err.process = `/v1/api/social-network/groups/group/${group_id}/update-image`
          logService.crashReport(err)
        })
      }

      // Uploading the new image to Cloudinary.
      let resultUploadImage = await cloudinary.uploader.upload(image.path)
      cloudinary_id = resultUploadImage.public_id
      let image_src = resultUploadImage.secure_url

      // If all before is successfully complete so the group image is updated in the DB.
      query = `
        update user_groups
        set
          image_src = ?,
          cloudinary_id = ?
        where id = ?
        limit 1;
      `
      await mariadb.query(query, [image_src, cloudinary_id, group_id])
      
      return {
        exit_code: 0,
        image_src
      }
    } catch (err) {
      err.file = __filename
      err.func = 'updateGroupImage'
      err.cloudinary_id = cloudinary_id
      throw err
    }
  }
}
