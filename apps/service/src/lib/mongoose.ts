import mongoose from 'mongoose';
import { log } from '@/src/lib/log';

const MONGO_CONNECT = process.env.MONGO_CONNECT;

let mongoConnected = false;

// Strip credentials from a Mongo URI so we can log it safely. Returns
// just protocol://host/db. Falls back to '<unparseable uri>' if URL
// parsing fails for any reason.
const safeUri = (uri: string): string => {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return '<unparseable uri>';
  }
};

const connectMongo = async () => {
  const ready = mongoose?.connection?.readyState;
  mongoConnected = ready == 1 || ready == 2;

  log(`connectMongo:: currently connected ${mongoConnected} ` +
      `readyState ${ready} connection count ${mongoose?.connections?.length}`);

  if (MONGO_CONNECT && !mongoConnected) {
    log(`Connecting to ${safeUri(MONGO_CONNECT)}`);
    const res = await mongoose.connect(MONGO_CONNECT);
    if (res) {
      mongoConnected = true;
      log(`Connected`, res.connection.readyState);
    } else {
      mongoConnected = false;
      log(`Failed to connect to ${safeUri(MONGO_CONNECT)}`);
    }
  }
};

export const disconnectMongo = async () => {
  mongoose.disconnect();
};

export default connectMongo;
