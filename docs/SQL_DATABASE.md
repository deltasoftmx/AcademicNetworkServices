# SQL Database documentation

This system use MariaDB v10.4 as database management system.

## Index

* [SQL Schema](#SQL-Schema)
* [Stored procedures](#Stored-procedures)
  * [Creates user](#Creates-user)
  * [Creates student](#Creates-student)
  * [Creates user type](#Creates-user-type)
  * [Creates an allowed domain](#Creates-an-allowed-domain)
  * [Creates an API key](#Creates-an-API-key)

## SQL Schema
![SQL Schema](diagrams/db.png)

## Stored procedures

SPs aid to perform complex process that require execute several queries and checks that must act as
a single one logic query. This approach is used to reduce the execution time when a service is called
at the backend.

All SPs which aim is modify in some way the database will return an exit code. 0 code is considered success.

SPs that modify the DB are write-type. SPs that only read data are read-type.

### Creates user

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

### Creates student

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

### Creates user type

#### Type

Write

#### Description

Creates a new user type.

#### SP name

`sp_user_type_create`

#### Exit codes

* 1: This name already exists.

### Creates an allowed domain

#### Type

Write

#### Description

Creates a new allowed domain.

#### SP name

`sp_domain_create`

#### Exit codes

* 1: This domain name already exists.

### Creates an API key

#### Type

Write

#### Description

Creates a new API key with the owner data related.

#### SP name

`sp_create_api_key`

#### Exit codes

No particular exit codes.
