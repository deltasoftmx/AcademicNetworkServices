const Logger = require('../lib/logger')
const path = require('path')

module.exports = {
  crashReport: function(err, toStdout = true) {
    logger = new Logger({
      method: err.method,
      process: err.process,
      logpath: path.join(process.cwd(), 'logs', 'crash_reports.log'),
      writeToFile: true,
      writeToStdout: toStdout
    })

    logger.error(err)
    logger.write()

    //Implements some mechanism to send an email to the  
    //server maintainers reporting this error.
  }
}
