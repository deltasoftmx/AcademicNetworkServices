# Group service

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [getGroupPermissions](#getGroupPermissions)
  * [searchGroups](#searchGroups)
  * [createGroup](#createGroup)
  * [switchGroupNotifications](#switchGroupNotifications)
  * [updateGroupImage](#updateGroupImage)

## Description

This service use the [MariaDB service](MARIADB.md) to perform queries to the database. This service is in charge of
read and write data of groups.

## Methods

### `getGroupPermissions`

* **Description**

Return the permissions that a group has.

* **Params**:
  * `groupId`: int
* **Return data type**: Promise\<Object>
  * `group_exists`: boolean. If the group exists.
  * `permissions`: Array\<Object>
    * `name`: string.
    * `codename`: string
* **Exit code**:
  * 1: Group doesn't exists.

### `searchGroups`

* **Description**

Return all the public groups or only the groups (public and private) that user belongs to.

* **Params**:
  * `groupRelativeType`: string.
  * `search`: string.
  * `offset`: int.
  * `page`: int.
  * `asc`: int.
  * `userId`: int.
* **Return data type**: Promise\<Object>
  * `groups`: Array\<Object>
    * `id`: int.
    * `name`: string.
    * `image_src`: string.
    * `description`: string.
  * `total_records`: int.
  
### `createGroup`

* **Description**

Creates a new group associating the user id provided as the owner.

* **Params**:
  * `userId`: int
  * `group`: Object
    * `group_name`: string
    * `image_src`: string
    * `description`: string
    * `visibility`: string
    * `permissions`: string
    * `tags`: Array\<int>
* **Return data type**: Promise\<Object>
  * `exit_code`: int
  * `message`: string
  * `id`: int, if exit_code = 0
* **Exit code**:
  * 1: User owner does not exists.
  * 2: Visibility not allowed.
  * 3: Permission does not exists

### `switchGroupNotifications`

* **Description**

Turn on or turn off the group notifications which the user requesting belongs to.

* **Params**
  * `userId`: int
  * `group_id`: int
  * `state`: int
* **Return data type**: Promise\<Object>
  * `exit_code`: int
  * `message`: string
* **Exit code**:
  * 1: User doesn't exist in the group memberships or the group doesn't exist
  * 2: Group notifications are already in that state.

### `updateGroupImage`

* **Description**

Update the group image. To do that the user requesting must be the group owner.

* **Params**
  * `group_id`: int.
  * `image`: Object.
      * `path`: string. Path of image in the local files.
  * `userId`: int.

* **Return data type**: Promise\<Object>
  * `exit_code`: int.
  * `image_src`: string, only if code = 0.

* **Exit code**:
  * 1: The group does not exist.
  * 2: Permission denied. You are not the group owner.