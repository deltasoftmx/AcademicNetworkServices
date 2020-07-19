const logService = require('./log.service')
const messages = require('../../conf/messages.json')

module.exports = {
  handleErrorInRequest: function(req, res, err) {
    if(!res.headersSent) {
      req.api.logger.error(err)
      res.status(500).finish({
        code: -5,
        messages: [messages.error_messages.e500]
      })
    }
    err.method = req.method
    err.process = req.api.endpoint.path
    logService.crashReport(err)
  }
}
