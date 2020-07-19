# Error handling service documentation

## Index

* [Description](#Description)
* [Methods](#Methods)
  * [handleErrorInRequest](#handleErrorInRequest)

## Description

This service is in charge of handling errors that have occurred during the execution process of an endpoint.
It use the [log service](LOG.md) to write logs.

## Methods

### `handleErrorInRequest`

* **Description**: Takes an error object and if headers haven't been sent, response with status 500 and with a 
code -5. Then write a crash report in the crash reports file and in the execution logs, if applicable. This is to manage unexpected errors
and keep the application running. See the [web services doc](../WEB_SERVICES.md) to getting know what means code -5.

* **Params**:
  * `req`: requestObject. The express req object.
  * `res`: responseObject. The express res object.
  * `err`: Error
    * `code`: string. The error code.
    * `messages`: string. The informative messages of the error.
    * `func`: string. The name of the function in which the error was originally caught.
    * `file`: string. The filename where the error was originally caught.
    * `stack`: string. The tracking made for Node.js.
* **Return data type**: void
