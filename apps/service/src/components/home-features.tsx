import { CloudArrowUpIcon, LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function HomeFeatures() {
  const features = [
    {
      name: 'Create an Account',
      description:
        'Create a new account on SumoBubble to start. Sign in with Google or (coming soon) other social accounts.',
      href: '#',
      icon: CloudArrowUpIcon
    },
    {
      name: 'Try Before Buy',
      description: 'Setup SumoBubble and fully customize it before trying out the fully operational preview',
      href: '#',
      icon: LockClosedIcon
    },
    {
      name: 'Subscribe and Deploy',
      description: 'Once you subscribe a few lines of code will be provided to put on your website. Thats it!',
      href: '#',
      icon: ArrowPathIcon
    }
  ];

  return (
    <div id="features" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Easy To Deploy</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Using SumoBubble is easy!</p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            There are 3 easy steps to get your SumoBubble running on your organizations website.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a href={feature.href} className="text-sm font-semibold leading-6 text-indigo-600">
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
