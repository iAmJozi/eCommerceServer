const {format} = require('date-fns')
const {v4: uuid} = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, fileName) => {
  const dateNow = new Date()
  const dateOnly = `${format(dateNow, 'yyyy-MM-dd')}`
  const timeOnly = `${format(dateNow, 'HH:mm:ss')}`
  const metadata = [dateOnly, timeOnly, uuid(), message]
  const logItem = `${metadata.join('\t')}\n`

  try {
    const logsDir = path.join(__dirname, '..', 'logs')
    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir)
    }
    await fsPromises.appendFile(`${logsDir}/${fileName}.log`, logItem)
  } catch (err) {
    console.log(err)
  }
}

const logger = (req, res, next) => {
  const reqMessage = [req.method, req.url, req.headers.origin]
  logEvents(reqMessage.join('\t'), 'req')

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    console.log(`${req.method} ${req.path}`)
  }
  next()
}

module.exports = {logEvents, logger}
