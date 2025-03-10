import Transport from 'winston-transport';
import { rdc } from '../db/redis/redis.db';

export default class RedisTransport extends Transport {
  private maxLogs: number;
  private key: string;

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
    this.maxLogs = 1000;
    this.key = 'logs';
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const logEntry = JSON.stringify({
      level: info.level,
      message: info.message,
      timestamp: info.timestamp,
    });

    rdc.lPush(this.key, logEntry)
      .then(() => rdc.lTrim(this.key, 0, this.maxLogs - 1))
      .catch(err => {
        console.error('Error storing log in Redis:', err);
      });

    callback();
  }
}
