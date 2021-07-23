const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Gets base data of a single publication.
   * If the user_id has a value, in the response is added if the user requesting likes the post.
   * @param {number} post_id Id of post to get the data.
   * @param {number} user_id Id of user requesting (optional).
   * @returns {object} An object with:
   * - id: number,
   * - username: string,
   * - firstname: string,
   * - lastname: string,
   * - profile_img_src: string,
   * - content: string,
   * - img_src: string,
   * - post_type: string,
   * - like_counter: number,
   * - created_at: datetime,
   * - liked_by_user: bool (if the user is authenticated),
   * - group_name: string,
   * - group_id: number
   */
  getBasePostData: async function(post_id, user_id = null) {
    let query = `
      select
        posts.id,
        users.username,
        users.firstname,
        users.lastname,
        users.profile_img_src,
        posts.content,
        posts.img_src,	
        posts.post_type,
        posts.like_counter,
        posts.created_at,
    `
    if (user_id) {
      query += `
        case 
          when favorite_posts.user_id = ? then 1 
          else 0
        end as liked_by_user,
      `
    }
    query += `
        case 
          when posts.post_type = 'group' then (
            select user_groups.name
            from posts
            inner join group_posts
              on posts.id = group_posts.post_id
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where posts.id = ?
          )
        end as group_name,
        case 
          when posts.post_type = 'group' then (
            select user_groups.id
            from posts
            inner join group_posts
              on posts.id = group_posts.post_id
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where posts.id = ?
          )
        end as group_id
      from posts
      inner join users
        on posts.user_id = users.id
    `
    if (user_id) {
      query += `
        left join favorite_posts
          on posts.id = favorite_posts.post_id
      `
    }
    query += `
      where 
        posts.id = ?
      limit 1;
    `
    try {
      let params = [post_id, post_id, post_id]
      if (user_id){
        params.unshift(user_id)
      }
      const basePost = await mariadb.query(query, params)
      return basePost[0]
    } catch (err) {
      err.file = __filename
      err.func = 'getBasePostData'
      throw err
    }
  },

  /**
   * Retrieves a list of publications made by users that the requesting user is following 
   * and publications that are associated to groups that the requesting user is part of. 
   * The publications are sorted in descending order according to their creation date.
   * Regarding the referenced post only sends the id of the post.
   * @param {number} user_id Id of user requesting.
   * @returns {Object}
   *  * posts: posts records
   *  * total_records: number
   */
  getPostsForTimeline: async function(user_id, offset = 10, page = 0) {
    const query = `
      select
        id,
        username,
        firstname,
        lastname,
        profile_img_src,
        content,
        img_src,
        post_type,
        like_counter,
        created_at,
        liked_by_user,
        group_name,
        group_id,
        referenced_post_id
      from (	
      (
        select
          posts.id,
          users.username,
          users.firstname,
          users.lastname,
          users.profile_img_src,
          posts.content,
          posts.img_src,	
          posts.post_type,
          posts.like_counter,
          posts.created_at,
          case 
            when favorite_posts.user_id = ? then 1 
            else 0
          end as liked_by_user,
          null as group_name,
          null as group_id,
          posts.referenced_post_id
        from posts
        inner join followers
          on posts.user_id = followers.target_user_id
        inner join users
          on posts.user_id = users.id
        left join favorite_posts
          on posts.id = favorite_posts.post_id
        where 
          followers.follower_user_id = ? and 
          (posts.post_type = 'user' or
          posts.post_type = 'shared')
      ) 
      union 
      (
        select 
          posts.id,
          users.username,
          users.firstname,
          users.lastname,
          users.profile_img_src,
          posts.content,
          posts.img_src,	
          posts.post_type,
          posts.like_counter,
          posts.created_at,
          case 
            when favorite_posts.user_id = ? then 1 
            else 0
          end as liked_by_user,
          user_groups.name as group_name,
          user_groups.id as group_id,
          posts.referenced_post_id
        from posts
        inner join group_posts
          on posts.id = group_posts.post_id
        inner join group_memberships
          on group_posts.group_id = group_memberships.group_id
        inner join user_groups
          on group_memberships.group_id = user_groups.id
        inner join users
          on posts.user_id = users.id
        left join favorite_posts
          on posts.id = favorite_posts.post_id
        where 
          group_memberships.user_id = ? and
          posts.user_id != ?
      )
      ) results
      order by created_at desc
      limit ?, ?;
    `
    // Counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 14, 'count(*) as total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')

    let params = new Array(5).fill(user_id)
    params.push(page * offset, offset)
    
    try {
      const postsResult = await mariadb.query(query, params)
      let countResult = await mariadb.query(countQuery, params)
      countResult = countResult[0]

      return {
        posts: postsResult,
        total_records: countResult ? countResult.total_records : 0
      }
    } catch (err) {
      err.file = __filename
      err.func = 'getPostsForTimeline'
      throw err
    }
  },

  /**
   * Gets data of a single publication, this includes the reference post id
   * in case that the post is "shared" type.
   * If the user_id has a value, in the response is added if the user requesting likes the post.
   * @param {number} post_id Id of post to get the data.
   * @param {number} user_id Id of user requesting (optional).
   * @returns {object} An object with:
   * - id: number,
   * - username: string,
   * - firstname: string,
   * - lastname: string,
   * - profile_img_src: string,
   * - content: string,
   * - img_src: string,
   * - post_type: string,
   * - like_counter: number,
   * - created_at: datetime,
   * - liked_by_user: bool (if the user is authenticated),
   * - group_name: string,
   * - group_id: number,
   * - referenced_post_id: number
   */
  getPostData: async function(post_id, user_id = null) {
    let query = `
      select
        posts.id,
        users.username,
        users.firstname,
        users.lastname,
        users.profile_img_src,
        posts.content,
        posts.img_src,	
        posts.post_type,
        posts.like_counter,
        posts.created_at,
    `
    if (user_id) {
      query += `
        case 
          when favorite_posts.user_id = ? then 1 
          else 0
        end as liked_by_user,
      `
    }
    query += `
        case 
          when posts.post_type = 'group' then (
            select user_groups.name
            from posts
            inner join group_posts
              on posts.id = group_posts.post_id
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where posts.id = ?
          )
        end as group_name,
        case 
          when posts.post_type = 'group' then (
            select user_groups.id
            from posts
            inner join group_posts
              on posts.id = group_posts.post_id
            inner join user_groups
              on group_posts.group_id = user_groups.id
            where posts.id = ?
          )
        end as group_id,
        posts.referenced_post_id
      from posts
      inner join users
        on posts.user_id = users.id
    `
    if (user_id) {
      query += `
        left join favorite_posts
          on posts.id = favorite_posts.post_id`
    }
    query += `
      where 
        posts.id = ?
      limit 1;
    `
    try {
      let params = [post_id, post_id, post_id]
      if (user_id) {
        params.unshift(user_id)
      }
      const post = await mariadb.query(query, params)
      return post[0]
    } catch (err) {
      err.file = __filename
      err.func = 'getPostData'
      throw err
    }
  },

  /**
   * Checks if the post provided is part of a private group, returns true or false. 
   * In case the post is not found it returns -1
   * @param {number} post_id 
   * @returns {boolean | number}
   */
  postBelongsToPrivateGroup: async function(post_id) {
    const query = `
      select 
        user_groups.id as group_id,
        user_groups.visibility
      from posts
      inner join group_posts
        on posts.id = group_posts.post_id
      inner join user_groups
        on group_posts.group_id = user_groups.id
      where posts.id = ?
      limit 1;
    `
    try {
      let result = await mariadb.query(query, [post_id])
      result = result[0]

      if (result === undefined) return -1
      return {
        group_id: result.group_id,
        group_private: result.visibility === 'private' ? true : false
      }
    } catch (err) {
      err.file = __filename
      err.func = 'postBelongsToPrivateGroup'
      throw err
    }
  },

  /**
   * Checks if the user provided belongs to the group provided.
   * Returns true or false.
   * @param {number} user_id 
   * @param {number} group_id 
   * @returns {boolean}
   */
  userBelongsToGroup: async function(user_id, group_id) {
    const query = `
      select id
      from group_memberships
      where user_id = ? and group_id = ?
      limit 1;
    `
    try {
      let result = await mariadb.query(query, [user_id, group_id])
      result = result[0]

      return (result === undefined ? false : true)
    } catch (err) {
      err.file = __filename
      err.func = 'userBelongsToGroup'
      throw err
    }
  }
}
