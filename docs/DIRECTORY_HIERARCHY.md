# Directory Hierarchy

## Index

## Directory structure

* certs/
* conf/
* docs/
* logs/
* src/
  * apis/
    * social_network/
      * controllers/
      * endpoints/
      * flows/
  * lib/
  * middlewares/
  * scripts/
  * services/

## Entry point, bootstrap file and boot sequence.

The entry point is the file `src/index.js`. This is the file which Node.JS will read first. This file will load
the bootstrap file, which is `src/app.js`. This file load the main modules of the application, which are the API
modules. Such modules can be founded at `src/apis/[module name]/interfaces.js`. These files will load the diferent
parts of their respective modules and their dependencies (as middlewares, services or libraries) and then, 
the whole application will be in memory.
