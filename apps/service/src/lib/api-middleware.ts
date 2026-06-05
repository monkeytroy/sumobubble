import type { NextApiRequest, NextApiResponse } from 'next';

type Middleware = (req: NextApiRequest, res: NextApiResponse, fn: (result: {} | Error) => void) => void;

/**
 * Helper method, called in api routes to run any middleware
 * Ex: performing cors checks on public facing api endpoints.
 *
 * @param req
 * @param res
 * @param fn the function called in the middle
 * @returns
 */
export const apiMiddleware = async (req: NextApiRequest, res: NextApiResponse, fn: Middleware) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: {}) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};
