# Post service documentation

## Index

* [Description](#description)
* [Methods](#methods)
  * [getPostsForTimeline](#getpostsfortimeline)
  * [getBasePostData](#getbasepostdata)
  * [getPostData](#getpostdata)
  * [postBelongsToPrivateGroup](#postbelongstoprivategroup)
  * [userBelongsToGroup](#userbelongstogroup)

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

### `getBasePostData`

* **Description**: 

Gets base data of a single publication. 
If the user_id has a value, in the response is added if the user requesting likes the post.

* **Params**:

  * `post_id`: int.
  * `user_id`: null | undefined | int. Not required.

* **Return data type**: Promise\<Object>
  * `id`: number,
  * `username`: string,
  * `firstname`: string,
  * `lastname`: string,
  * `profile_img_src`: string,
  * `content`: string,
  * `img_src`: string,
  * `post_type`: string,
  * `like_counter`: number,
  * `created_at`: datetime,
  * `liked_by_user`: bool (if user_id has a value),
  * `group_name`: string,
  * `group_id`: number

### `getPostData`

* **Description**: 

Gets data of a single publication, this includes the reference post id in case that the post 
is "shared" type.
If the user_id has a value, in the response is added if the user requesting likes the post.

* **Params**:

  * `post_id`: int.
  * `user_id`: null | undefined | int. Not required.

* **Return data type**: Promise\<Object>
  * `id`: number,
  * `username`: string,
  * `firstname`: string,
  * `lastname`: string,
  * `profile_img_src`: string,
  * `content`: string,
  * `img_src`: string,
  * `post_type`: string,
  * `like_counter`: number,
  * `created_at`: datetime,
  * `liked_by_user`: bool (if user_id has a value),
  * `group_name`: string,
  * `group_id`: number
  * `referenced_post_id`: number

### `postBelongsToPrivateGroup`

* **Description**: 

Checks if the post provided is part of a private group, returns true or false. 
In case the post is not found it returns -1

* **Params**:

  * `post_id`: int.

* **Return data type**: Promise\<boolean | number>

### `userBelongsToGroup`

* **Description**: 

Checks if the user provided belongs to the group provided.
Returns true or false.

* **Params**:

  * `user_id`: int.
  * `group_id`: int.

* **Return data type**: Promise\<boolean>