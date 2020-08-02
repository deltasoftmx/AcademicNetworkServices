const { Validator, parseValidatorOutput, parseNumberFromGroupIfApplic } = require('../services/validator.service')


module.exports = {
  checkGroupId: function(req, res, next) {
    let validator = new Validator()
    req.params = parseNumberFromGroupIfApplic(req.params)
    validator(req.params).required().isObject( obj =>{
      obj('group_id').required().isNumber().integer()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    return next()
  }
}
