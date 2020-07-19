const Logger = require('../lib/logger')
const path = require('path')

module.exports = {
  crashReport: function(err) {
    logger = new Logger({
      method: err.method,
      process: err.process,
      logpath: path.join(process.cwd(), 'logs', 'crash_reports.log'),
      writeToFile: true
    })

    logger.error(err)
    logger.write()

    //Implements some mechanism to send an email to the  
    //server maintainers reporting this error.
  }
}
