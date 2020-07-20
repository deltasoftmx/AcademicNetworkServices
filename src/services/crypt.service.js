const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

publicKey = ''
privateKey = ''

function getPublicKey() {
  try {
    if(publicKey == '' || !publicKey) {
      publicKey = fs.readFileSync(path.join(process.cwd(), 'certs', 'academy_network.pem'), { encoding: 'utf8' })
    }
    return publicKey
  } catch(err) {
    err.file = __filename
    err.func = 'getPublicKey'
    throw err
  }
}

function getPrivateKey() {
  try {
    if(publicKey == '' || !publicKey) {
      privateKey = fs.readFileSync(path.join(process.cwd(), 'certs', 'academy_network'), { encoding: 'utf8' })
    }
    return privateKey
  } catch(err) {
    err.file = __filename
    err.func = 'getPrivateKey'
    throw err
  }
}

module.exports = {
  generateJWT: async function(payload, expIn) {
    return jwt.sign(payload, getPrivateKey(), { expiresIn: expIn, algorithm: 'RS256' })
  },

  //Can throw exceptions. See: https://www.npmjs.com/package/jsonwebtoken
  verifyJWT: async function(token) {
    return jwt.verify(token, getPublicKey(), { algorithms: 'RS256' })
  },

  hash: function(data) {
    let hash = crypto.createHash('sha256')
    hash.update(data)
    return hash.digest('hex')
  }
}