const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Get base data of a single publication.
   * @param {number} post_id Id of post to get the data.
   * @param {number} user_id Id of user requesting.
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
   * - liked_by_user: bool,
   * - group_name: string,
   * - group_id: string
   */
  getBasePostData: async function(post_id, user_id) {
    const query = `
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
      left join favorite_posts
        on posts.id = favorite_posts.post_id
      where 
        posts.id = ?
      limit 1;
    `
    try {
      const basePost = await mariadb.query(query, [user_id, post_id, post_id, post_id])
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
      limit ${page * offset}, ${offset};
    `
    // Counts how much records there are.
    let countQuery = query.split('\n')
    // Remove selected fields and select the amount of records.
    countQuery.splice(2, 14, 'count(*) as total_records')
    // Remove limit to select all the records.
    countQuery.pop(); countQuery.pop()
    countQuery = countQuery.join('\n')

    try {
      const params = new Array(5).fill(user_id)
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
  }
}
