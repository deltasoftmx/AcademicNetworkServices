/**
 * This is the bootstrap file. Load the required modules to make work the application.
 */

 //Test the environment.
require('./scripts/verify_env')

//Including dependencies.
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const moment = require('moment')
const cloudinary = require('cloudinary').v2
const generalMidd = require('./middlewares/general.middleware')
const conf = require('../etc/conf.json')

//General settings.
moment.locale(conf.moment.language);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

//Creating a express server.
const app = express()

//Setting gobal middlewares.
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(generalMidd.setResponseFormat)

//Importing APIs.
const socialNetworkAPI = require('./apis/social_network/interfaces')

//Setting middlewares for this API.
app.use('/v1/api/social-network', generalMidd.setLogger({
  logpath: path.join(process.cwd(), 'logs', 'social_network_api.log'),
  writeToFile: conf.path_tracking.write_to_file,
  writeToStdout: conf.path_tracking.write_to_stdout
}))
//Setting the API.
app.use('/v1/api/social-network', socialNetworkAPI)

module.exports = app
