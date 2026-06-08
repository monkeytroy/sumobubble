import mongoose, { type Mongoose } from 'mongoose';
import { log } from '@/src/lib/log';

const MONGO_CONNECT = process.env.MONGO_CONNECT;

const safeUri = (uri: string): string => {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return '<unparseable uri>';
  }
};

type Cache = { conn: Mongoose | null; promise: Promise<Mongoose> | null };

const globalForMongoose = globalThis as unknown as { __mongooseCache?: Cache };
const cache: Cache = globalForMongoose.__mongooseCache ?? { conn: null, promise: null };
globalForMongoose.__mongooseCache = cache;

const isAlive = (conn: Mongoose | null) => conn?.connection?.readyState === 1;

const connectMongo = async (): Promise<Mongoose> => {
  if (!MONGO_CONNECT) throw new Error('MONGO_CONNECT is not set');

  if (cache.conn && isAlive(cache.conn)) return cache.conn;

  if (!cache.promise) {
    log(`Connecting to ${safeUri(MONGO_CONNECT)}`);
    cache.promise = mongoose
      .connect(MONGO_CONNECT, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000
      })
      .then((m) => {
        log(`Connected readyState=${m.connection.readyState}`);
        return m;
      });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
};

export const disconnectMongo = async () => {
  mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
};

export default connectMongo;
