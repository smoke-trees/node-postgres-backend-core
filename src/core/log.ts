import { createLogger, format, Logger, transports } from 'winston'
import { ContextProvider } from '@smoke-trees/smoke-context'

const contextFormat = format((info) => {
  const context = ContextProvider.getContext()
  info.traceId = context?.traceId
  return info
})
const debugFormat = format.printf(info => {
  let out = `${info.timestamp}: ${info.level}: ${info.message}`;

  if (info.traceId) {
    out = out + '\n Trace Id: ' + info.traceId;
  }
  if (info.functionName) {
    out = out + '\n Function Name: ' + info.functionName;
  }
  if (info?.error) {
    out = out + '\n Error Stack: ' + info.error;
  }
  if (info.metadata) {
    out = out + '\n Metadata:' + JSON.stringify(info.metadata)
  }
  return out;
})

const wTransports = [
  new transports.Console({
    handleExceptions: true,
    format: process.env.NODE_ENV === 'production'
      ? format.combine(contextFormat(), format.timestamp(), format.json())
      : format.combine(contextFormat(), format.timestamp(), format.colorize(),
        format.metadata({ fillExcept: ['message', 'timestamp', 'functionName', 'error', 'level', 'traceId'] }),
        debugFormat,
      )
  })
]

const logger = createLogger({
  transports: wTransports
})

class CustomLogger {
  private _logger: Logger

  public get logger(): Logger {
    return this._logger
  }

  public set logger(value: Logger) {
    this._logger = value
  }

  constructor(logger: Logger) {
    this._logger = logger
  }

  info(message: string, functionName?: string, meta?: any): void {
    this._logger.info(message, { functionName, ...meta })
  }

  debug(message: string, functionName?: string, meta?: any): void {
    this._logger.debug(message, { functionName, ...meta })
  }

  trace(message: string, functionName?: string, meta?: any): void {
    this._logger.error(message, { functionName, ...meta })
  }

  error(message: string, functionName?: string, error?: unknown, meta?: any): void {
    this._logger.error(message, {
      error: error instanceof Error && error.stack,
      functionName,
      ...meta
    })
  }

  warn(message: string, functionName?: string, meta?: any): void {
    this._logger.warn(message, { functionName, ...meta })
  }

  fatal(message: string, functionName?: string, meta?: any): void {
    this._logger.error(message, { functionName, ...meta })
  }
}

export const log = new CustomLogger(logger)

export default log
