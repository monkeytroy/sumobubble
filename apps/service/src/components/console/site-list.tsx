import { useAppStore } from '@/src/store/app-store';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function SiteList() {
  const sites = useAppStore((state) => state.sites);
  const removeSite = useAppStore((state) => state.removeSite);

  return (
    <div className="flex flex-col gap-2">
      <div className="block text-sm font-medium leading-6 text-gray-900">
        {sites?.length > 0 && <span>Choose a Site to Edit ({sites?.length} Sites)</span>}
      </div>
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 select-none">
          {sites?.map((val) => (
            <a
              href={`/console/site/${val._id}/setup`}
              key={val._id}
              className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm 
                focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 
                hover:border-gray-400 hover:bg-blue-100
                flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="">
                  <p className="text-sm font-medium text-gray-900">{val.title}</p>
                  <p className="truncate text-sm text-gray-500"></p>
                </div>
              </div>
              <div
                className="text-sm font-medium text-gray-500 hover:text-gray-600 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  removeSite(val._id);
                }}>
                <TrashIcon className="w-5 h-auto"></TrashIcon>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
