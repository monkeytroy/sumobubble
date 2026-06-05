import { useAppStore } from '@/src/store/app-store';
import { useState } from 'react';

export default function SiteAdd() {
  const [newSiteName, setNewSiteName] = useState('');
  const addSite = useAppStore((state) => state.addSite);

  const onAddButton = async () => {
    // exit early
    if (!newSiteName) {
      return;
    }

    // call store action
    const res = await addSite(newSiteName);
  };

  return (
    <div className="flex flex-col gap-4 w-1/2 min-w-fit">
      <div className="flex flex-col gap-2">
        <label htmlFor="siteName" className="block text-sm font-medium leading-6 text-gray-900">
          New Site Name
        </label>
        <div className="">
          <input
            id="siteName"
            name="siteName"
            type="text"
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
              ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 disabled:opacity-30
              focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onAddButton}
        className="rounded-md bg-indigo-600 p-1 text-white shadow-sm 
          hover:bg-indigo-500 focus-visible:outline disabled:opacity-30
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        Add
      </button>
    </div>
  );
}
