const multer = require('multer')
const generalMidd = require('../../../middlewares/general.middleware')
const userMidd = require('../../../middlewares/users.middleware')
const userCtrl = require('../controllers/users.controller')

// Multer settings.
const upload = multer({dest: 'uploads/'})

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

  getPublicUserData: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    userMidd.checkGetPublicUserDataParameter,
    userCtrl.getPublicUserData
  ],

  post: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    userMidd.checkNewPostData,
    upload.single('image'),
    userCtrl.createPost
  ],
  
  searchUsers: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    userMidd.checkSearchUserParams,
    userCtrl.searchUsers
  ],

  getPublicUserTypes: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    userCtrl.getPublicUserTypes
  ],

  getMajorsData: [
    generalMidd.allowExternalConnections,
    generalMidd.verifyAPIKey,
    userCtrl.getMajorsData
  ]
}
