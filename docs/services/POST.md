# Post service documentation

## Index

* [Description](#description)
* [Methods](#methods)
  * [getPostsForTimeline](#getpostsfortimeline)

## Description

## Methods

### `getPostsForTimeline`

* **Description**: 

Retrieves a list of publications made by users that the requesting user is following and publications 
that are associated to groups that the requesting user is part of. The publications are sorted in 
descending order according to their creation date. Records are served into groups of a certain size. Regarding the referenced post only sends the id of the post.

* **Params**:

  * `page`: int.
  * `offset`: int.

* **Return data type**: Promise\<Object>
  * `posts`: Array\<Object>
    * `id`: int,
    * `username`: string,
    * `firstname`: string,
    * `lastname`: string,
    * `profile_img_src`: string,
    * `content`: string,
    * `img_src`: string,
    * `post_type`: string,
    * `like_counter`: int,
    * `created_at`: date,
    * `liked_by_user`: bool,
    * `group_name`: string,
    * `group_id`: string,
    * `referenced_post_id`: int
  * `total_records`: int.