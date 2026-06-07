import { MongoClient } from "mongodb";

// In dev, Next's HMR re-imports modules — we stash the connect promise
// on globalThis so the same MongoClient is reused across reloads instead
// of opening a new connection on every code edit.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGO_CONNECT) {
  throw new Error('Invalid/Missing environment variable: "MONGO_CONNECT"');
}

const uri = process.env.MONGO_CONNECT;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  //In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;