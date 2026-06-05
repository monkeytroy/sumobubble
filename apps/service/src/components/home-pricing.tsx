import { signIn, useSession } from 'next-auth/react';
import { IAppProps } from '@/src/services/types';

export default function HomePricing(props: IAppProps) {
  const { data: session } = useSession();

  return (
    <div className="py-24 sm:py-32 select-none bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl">Pricing plans made easy</p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Choose an affordable plan that is perfect for your organization and customers.
        </p>

        <div className="isolate mx-auto mt-10 relative">
          {!session && (
            <div
              className="absolute inset-0 opacity-0 bg-gray-800 cursor-pointer"
              onClick={() => signIn('auth0', { callbackUrl: '/#pricing' })}></div>
          )}

          <div data-testid="pricing-table-container">
            {props.stripe?.key && props.stripe?.homeId && (
              <stripe-pricing-table
                data-testid="pricing-table"
                customer-email={session?.user?.email}
                success-url="/console/thanks"
                pricing-table-id={props.stripe?.homeId}
                publishable-key={props.stripe?.key}></stripe-pricing-table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
