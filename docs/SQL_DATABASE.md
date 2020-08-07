# SQL Database documentation

This system use MariaDB v10.4 as database management system.

## Index

* [SQL Schema](#SQL-Schema)
* [Stored procedures](#Stored-procedures)
  * [Create user](#Create-user)
  * [Create student](#Create-student)
  * [Create user type](#Create-user-type)
  * [Create an allowed domain](#Create-an-allowed-domain)
  * [Create an API key](#Create-an-API-key)

## SQL Schema
![SQL Schema](diagrams/db.png)

## Stored procedures

SPs aid to perform complex process that require execute several queries and checks that must act as
a single one logic query. This approach is used to reduce the execution time when a service is called
at the backend.

All SPs which aim is modify in some way the database will return an exit code. 0 code is considered success.

SPs that modify the DB are write-type. SPs that only read data are read-type.

### Create user

#### Type

Write

#### Description

Creates a new base user in the system.

#### SP name

`sp_user_create`

#### Exit codes

* 1: Domain name not allowed.
* 2: Email already exists.
* 3: Username already exists.
* 4: User type id doesn't exists.

### Create student

#### Type

Write

#### Description

Creates a new student by an existing user.

#### SP name

`sp_create_student`

#### Exit codes

* 1: User already registered as student.
* 2: User doesn't exists.
* 3: Major doesn't exists.

### Create user type

#### Type

Write

#### Description

Creates a new user type.

#### SP name

`sp_user_type_create`

#### Exit codes

* 1: This name already exists.

### Create an allowed domain

#### Type

Write

#### Description

Creates a new allowed domain.

#### SP name

`sp_domain_create`

#### Exit codes

* 1: This domain name already exists.

### Create an API key

#### Type

Write

#### Description

Creates a new API key with the owner data related.

#### SP name

`sp_create_api_key`

#### Exit codes

No particular exit codes.

### Create group permission

#### Type

Write

#### Description

Create a new group permission.

#### SP name

`group_permission_create`

#### Exit codes

* 1: Name already exists.
* 2: Codename already exists.

### Create group

#### Type

Write

#### Description

Creates a new group

#### SP name

`group_create`

#### Exit codes

* 1: User owner does not exists.
* 2: Visibility not allowed.

### Add a permission to a group

#### Type

Write

#### Description

Adds a permission to a group.

#### SP name

`group_grant_permission`

#### Exit codes

* 1: Permission does not exists.
* 2: Permission already granted.

### Add a tag to a group

#### Type

Write

#### Description

Adds a permission to a group.

#### SP name

`group_add_tag`

#### Exit codes

* No codes.
