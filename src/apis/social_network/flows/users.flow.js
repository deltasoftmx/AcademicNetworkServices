const generalMidd = require('../../../middlewares/general.middleware')
const userMidd = require('../../../middlewares/users.middleware')
const userCtrl = require('../controllers/users.controller')

module.exports = {
  signup: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    userMidd.checkSignUpData,
    userMidd.checkStudentSignUpData,
    userCtrl.createStudent
  ],

  signin: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    userMidd.checkSignInData,
    userCtrl.signIn
  ],

  getData: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    userMidd.checkGetDataParameter,
    userCtrl.getUserData
  ]
}
