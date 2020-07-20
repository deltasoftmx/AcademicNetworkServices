# User service documentation

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [createUser](#createUser)
  * [createStudent](#createStudent)

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
