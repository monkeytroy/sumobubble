import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { log } from './src/lib/log';

const UNAUTH_PAGE = '/';

const protectedRoutes = ['/console/*', '/sections/*'];

const protectedApi = [
  {
    method: 'PUT',
    route: '/api/config'
  },
  {
    method: 'POST',
    route: '/api/config'
  },
  {
    method: 'DELETE',
    route: '/api/config'
  },
  {
    method: 'PUT',
    route: '/api/files'
  }
];

export enum Role {
  user = 'user',
  admin = 'admin'
}

/**
 * Handle unauthorized access to pages in protectedRoutes. Redirects to login for now.
 * @param req
 * @param res
 * @returns
 */
export const middleware = async (req: NextRequest, res: NextResponse) => {
  //log('pathname: ' + req.nextUrl.pathname);
  const pathname = req.nextUrl.pathname;

  const authHeader = req.headers.get('authorization');
  const jwt = await getToken({ req, secret: process.env.JWT_SECRET });

  // get users role.
  //log(`jwt ${jwt?.provider} role ${jwt?.role}`);

  // validate api
  if (protectedApi.filter((v) => v.method == req.method && req.nextUrl.pathname.startsWith(v.route)).length > 0) {
    //log('In protected api route ', jwt, authHeader);

    if (!jwt && authHeader !== 'Bearer ' + process.env.API_TOKEN) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        status: 403,
        headers: { 'content-type': 'application/json' }
      });
    }
  }

  // validate page routes
  if (
    protectedRoutes.includes(pathname) ||
    protectedRoutes.filter((val) => val.endsWith('/*') && pathname.startsWith(val.replace('/*', ''))).length > 0
  ) {
    //log('In protected route ', jwt);

    if (!jwt) {
      log('Redirect no jwt');
      return NextResponse.redirect(new URL(UNAUTH_PAGE, req.url));
    }
  }

  return NextResponse.next();
};
