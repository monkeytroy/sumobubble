import { ROUTES } from '@/src/constants/routes';
import router from 'next/router';

export default function Thanks() {
  setTimeout(() => {
    router.push(ROUTES.CONSOLE);
  }, 2500);

  return (
    <div className="flex justify-center items-center mt-12">
      <div className="rounded-md bg-gray-100 p-8">
        <div className="flex text-center">
          <div className="ml-3">
            <h3 className="text-3xl font-medium text-green-800">WOW!</h3>
            <div className="text-xl mt-2 text-green-700 flex flex-col gap-6">
              <div>Thank you so much for your subscription! We think you have made the right choice.</div>
              <div>Let&apos;s get you on your way!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
