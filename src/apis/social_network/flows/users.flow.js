const multer = require('multer')
const generalMidd = require('../../../middlewares/general.middleware')
const userMidd = require('../../../middlewares/users.middleware')
const userCtrl = require('../controllers/users.controller')

// Multer settings.
const upload = multer({dest: 'uploads/'})

module.exports = {
  signup: [
    generalMidd.verifyAPIKey,
    userMidd.checkSignUpData,
    userMidd.checkStudentSignUpData,
    userCtrl.createStudent
  ],

  signin: [
    generalMidd.verifyAPIKey,
    userMidd.checkSignInData,
    userCtrl.signIn
  ],

  getPublicUserData: [
    generalMidd.verifyAPIKey,
    userMidd.checkGetPublicUserDataParameter,
    userCtrl.getPublicUserData
  ],

  post: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    upload.single('image'),
    userMidd.checkNewPostData,
    userCtrl.createPost
  ],
  
  searchUsers: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    userMidd.checkSearchUserParams,
    userCtrl.searchUsers
  ],

  getPublicUserTypes: [
    generalMidd.verifyAPIKey,
    userCtrl.getPublicUserTypes
  ],

  getMajorsData: [
    generalMidd.verifyAPIKey,
    userCtrl.getMajorsData
  ]
}
