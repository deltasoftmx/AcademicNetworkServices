const mariadb = require('./mariadb.service')

module.exports = {
  /**
   * Creates a new user in the system.
   * @param {Object} user An object with:
   * - firstname: string.
   * - lastname: string.
   * - username: string.
   * - email: string.
   * - passwd: string.
   * - profile_img_src: string.
   * - description: string.
   * - user_type_id: int.
   */
  createUser: async function(user) {
    let at_index = user.email.indexOf('@')
    let domain_name = user.email.substring(at_index + 1)
    let args = [user.firstname, user.lastname, user.username, user.email, user.passwd, 
                user.profile_img_src || '', user.description || '', user.user_type_id, domain_name]
    try {
      let result = await mariadb.query('call sp_user_create(?,?,?,?,?,?,?,?, ?)', args)
      return result[0][0]
    } catch(err) {
      err.file = __filename
      err.func = 'createUser'
      throw err
    }
  },

  /**
   * Creates a new student in the system.
   * @param {Object} user An object with:
   * - firstname: string.
   * - lastname: string.
   * - email: string.
   * - passwd: string.
   * - profile_img_src: string.
   * - description: string.
   * - user_type_id: int.
   * - student_id: string.
   * - major_id: int
   */
  createStudent: async function(user) {
    //Setting data to create a new user.
    let at_index = user.email.indexOf('@')
    let domain_name = user.email.substring(at_index + 1)
    let createUserArgs = [user.firstname, user.lastname, user.student_id, user.email, user.passwd, 
                user.profile_img_src || '', user.description || '', user.user_type_id, domain_name]
    let conn
    try {
      //Getting a new connection that must be released at the end.
      conn = await mariadb.getConnection()
      //Start a transaction to perform the process because it is composed by two steps.
      conn.beginTransaction()
      //Calling the SP to create the user. First step.
      let createUserResult = await conn.query('call sp_user_create(?,?,?,?,?,?,?,?, ?)', createUserArgs)
      createUserResult = createUserResult[0][0]
      let result = createUserResult

      //If it gone well, perform the rest.
      if (createUserResult.exit_code == 0) {
        //Setting data to create a new student using the last user created.
        let createStudentArgs = [createUserResult.id, user.student_id, user.major_id]
        //Calling SP to create the student. Second step.
        let createStudentResult = await conn.query('call sp_create_student(?, ?, ?)', createStudentArgs)
        createStudentResult = createStudentResult[0][0]
        result = createStudentResult
        
        //If it gone well, commit the transaction, release the connection and return the response.
        if(createStudentResult.exit_code == 0) {
          conn.commit()
          conn.release()
          return {
            exit_code: 0,
            user_id: createUserResult.id,
            student_data_id: createStudentResult.id,
            message: "Done"
          }
        }

        //Because both SP start their exit codes at 0, is necessary avoid the codes of both overlap between them.
        //So, it's necessary adjust the exit code of the second SP, if applicable, assigning a exit code
        //starting by the next number of the last exit code of the first SP.
        //Read the documentation of "sp_user_create" and "sp_create_student" in the SQL database documentation. 
        //Also the documentation of this function in the services documentation for more details.
        if(result.exit_code == 3) {
          result.exit_code = 5;
        } else {
          throw new Error(`Error trying to create a new student by a new user. 
                          sp_create_student's exit_code: ${result.exit_code}`)
        }
      }
      //If something gone wrong, rollback, release the connection and response what gone wrong.
      conn.rollback()
      conn.release()
      return result
    } catch(err) {
      //Something gone wrong with the connector.
      //Rollback, release and throw the error again.
      conn.rollback()
      conn.release()
      
      err.file = __filename
      err.func = 'createStudent'
      throw err
    }
  }
}
