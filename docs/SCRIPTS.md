# Scripts documentation

## Index

* [Description](#Description)
* [Setup environment](#Setup-environment)

## Description

Some tasks might be tedious. That is why we have written some scripts to automate that tasks. Here is the documentation
to use those scripts. All scripts are in `src/scripts`.

## Setup environment

**Filename**: `setup_env.js`

**Description**: Creates the configuration file, certificates, environment variables and runs the database scripts to initialize it.
By default only perform missing configurations. You need to provide at least the user database and their password when use this script.

Option follow this format: `[option name]=[value]`. The value must not have spaces. If the option allow a list of option, each value
must be separated by a comma.

Default values of the environment variable are:

* MARIADB_HOST=localhost
* MARIADB_USER=[provided by `--db-username`]
* MARIADB_PASS=[provided by `--db-passwd`]
* MARIADB_DATABASE=academy_network
* IANA_TIMEZONE=America/Cancun
* PORT=3000

The rest of the default values are shown [here](ENV_SETUP.md).

**Options**

* `--db-username`

User database.

* `--db-passwd`

Password of the above user.

* `--force-reconf`

No arguments are required for this. When this flag is present overwrite all existing configuration, if `--reconf-target`
is not given.

* `--reconf-target`

Indicates what elements of the environment configuration reconfigurate. Values can be: `env|db|certs|conf-file`

* `--help`

Display a minified version of this documentation.

**Example**

node setup_env.js --db-user=ale --db-passwd=qwerty --force-reconf --reconf-target=env,db

This will overwrite the current configuration of the environment variables and the database with the default configuration.
Also will add missing configuration of the remaining elements.
