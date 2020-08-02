# Group service

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [getGroupPermissions](#getGroupPermissions)

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
