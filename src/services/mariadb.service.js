const mariadb = require('mariadb')
const conf = require('../../conf/conf.json')

const pool = mariadb.createPool({
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASS,
  host: process.env.MARIADB_HOST,
  database: process.env.MARIADB_DATABASE,
  connectionLimit: conf.db.conn_limit,
  timezone: process.env.IANA_TIMEZONE,
  port: process.env.MARIADB_PORT
})

module.exports = pool
