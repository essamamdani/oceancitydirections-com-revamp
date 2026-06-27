// Logger utility - Only shows logs in development or when LOG_LEVEL=debug
// Error logs always show

const isDev = process.env.NODE_ENV !== 'production'
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'error')

const logger = {
  log: (...args) => {
    if (logLevel === 'debug' || isDev) {
      console.log(...args)
    }
  },
  info: (...args) => {
    if (logLevel === 'debug' || logLevel === 'info' || isDev) {
      console.info(...args)
    }
  },
  warn: (...args) => {
    if (logLevel !== 'error' || isDev) {
      console.warn(...args)
    }
  },
  error: (...args) => {
    // Errors always show
    console.error(...args)
  }
}

export default logger
