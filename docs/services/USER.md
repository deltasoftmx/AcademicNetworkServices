# User service documentation

## Index

* [Description](#description)
* [Methods](#methods)
  * [createUser](#createuser)
  * [createStudent](#createstudent)
  * [getPublicUserData](#getpublicuserdata)
  * [createPost](#createpost)
  * [searchUsers](#searchusers)
  * [getPublicUserTypes](#getpublicusertypes)
  * [getMajorsData](#getmajorsdata)

## Description

This service use the [MariaDB service](MARIADB.md) to perform queries to the database. This service is in charge of
read and write user data.

## Methods

### `createUser`

* **Description**: Creates a new base user in the system.
* **Params**
  * `user`: Object.
    * `firstname`: string.
    * `lastname`: string.
    * `username`: string.
    * `email`: string.
    * `passwd`: string.
    * `profile_img_src`: string.
    * `description`: string.
    * `user_type_id`: int.
* **Return data type**: Promise\<Object>
  * `exit_code`: int.
  * `message`: string.
  * `id`: int. This will only be if `exit_code` = 0.
* **Exit code**:
  * 1: Domain name not allowed.
  * 2: Email already exists.
  * 3: Username already exists.
  * 4: User type doesn't exists.

### `createStudent`

* **Description**: Creates a new base user and then register it as a student.
* **Params**
  * `user`: Object.
    * `firstname`: string.
    * `lastname`: string.
    * `email`: string.
    * `passwd`: string.
    * `profile_img_src`: string.
    * `description`: string.
    * `user_type_id`: int.
    * `student_id`: string. The ID asigned by the school, not a table id.
    * `major_id`: int.
* **Return data type**: Promise\<Object>
  * `exit_code`: int.
  * `message`: string.
  * `user_id`: int. This will only be if `exit_code` = 0.
  * `student_data_id`: int. This will only be if `exit_code` = 0.
* **Exit codes**:
  * 1: Domain name not allowed.
  * 2: Email already exists.
  * 3: Username already exists.
  * 4: User type doesn't exists.
  * 5: Major doesn't exists.

### `getPublicUserData`

* **Description**: Retrieve the user public information according of the user type.
* **Params**
  * `username`: string
* **Return data type**: Promise\<Object>
  * `user`: Object.
    * `username`: string.
    * `firstname`: string.
    * `lastname`: string.
    * `email`: string. This will not apply if the user is a student.
    * `type_user`: string.
    * `description`: string.
    * `profile_img_src`: string.
    * `major_id`: string. This will only be if the user is a student.

### `createPost`

* **Description**: Create a new user post, either only text or text with an image.
* **Params**
  * `userId`: int.
  * `post`: Object.
    * `content`: string.
    * `image`: Object.
      * `path`: string. Path of image in the local files.
* **Return data type**: Promise\<Object>
  * `content`: string.
  * `img_src`: string.

### `searchUsers`

* **Description**: 

Perform a search in the database retrieving all the user records that match with 'search' parameter.

It gets all users, followers or users followed by a target user. This can be set in 'userRelativeType' using: all|followers|followed.

It can selects chunks of records of 'offset' size. The chunk number is defined by 'page'.

It supports ascending and descending order by register date.

* **Params**:
  * `userRelativeType`: string.
  * `page`: int.
  * `offset`: int.
  * `search`: string.
  * `asc`: int.
  * `userTarget`: int.
* **Return data type**: Promise\<Object>
  * `users`: Array\<Object>
    * `username`: string.
    * `firstname`: string.
    * `lastname`: string.
    * `profile_img_src`: string.
  * `total_records`: int.

### `getPublicUserTypes`

* **Description**: Retrieve the name and id of all the public user types.
* **Params**
  * void
* **Return data type**: Promise\<Array\<Object>>
  * `name`: string.
  * `id`: string.

### `getMajorsData`

* **Description**: Retrieve the name and id of all the available majors.
* **Params**
  * void
* **Return data type**: Promise\<Array\<Object>>
  * `name`: string.
  * `id`: string.
