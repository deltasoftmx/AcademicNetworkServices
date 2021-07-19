const { Validator, parseValidatorOutput, parseNumberFromGroupIfApplic } = require('../services/validator.service')

module.exports = {
  checkPaginationParams: function(req, res, next) {
    let validator = new Validator()
    req.query = parseNumberFromGroupIfApplic(req.query)

    validator(req.query).isObject(obj => {
      obj('offset').isNumber().integer().isPositive()
      obj('page').isNumber().integer().notNegative()
    })

    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    
    next()
  }
}
