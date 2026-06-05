const debug = process.env.IS_DEV;

/**
 * Abstract logging to move eventually to a logger api or service
 * @param args
 */
export const log = (...args: any) => {
  if (debug) {
    console.log(...args);
  }
};
