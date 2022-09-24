import Morgan from 'morgan'
import logger from './log'
import { Logger } from 'winston'

const logStream = {
  write: (message: string): Logger => logger.logger.info(message)
}

export const morgan = Morgan('common', { stream: logStream })

export default morgan
