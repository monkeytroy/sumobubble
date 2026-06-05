import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error() {
  return (
    <div className="flex justify-center items-center mt-12">
      <div className="rounded-md bg-yellow-50 p-4 w-144 shadow-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-yellow-800">Oh no!</div>
            <div className="mt-2 text-sm text-yellow-700">
              <p>There is a problem loading the account details. Please notify support!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
