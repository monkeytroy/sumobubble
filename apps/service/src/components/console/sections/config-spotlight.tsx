import { useAppStore } from '@/src/store/app-store';
import { ExclamationCircleIcon, TvIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useCallback } from 'react';
import { ISection } from '@/src/components/console/types';
import { ConsoleBody } from '@/src/components/console/console-body';
import { ISiteSection } from '@/src/models/site';

export const section: ISection = {
  name: 'spotlight',
  title: 'Spotlight',
  description: 'A video or channel to spotlight for your guests.',
  icon: <TvIcon />,
  class: '',
  component: <ConfigSpotlight />
};

export default function ConfigSpotlight() {
  // load this site and editable values
  const site = useAppStore((state) => state.site);
  const updateSite = useAppStore((state) => state.updateSite);
  const saving = useAppStore((state) => state.saving);

  const thisSection: ISiteSection | undefined = site?.sections[section.name];

  // setup local state for editing.
  const [enabled, setEnabled] = useState(false);
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');

  // local component state
  const [invalid, setInvalid] = useState(false);

  // reset to site state
  const reset = useCallback(() => {
    setEnabled(!!thisSection?.enabled);
    setContent(thisSection?.content || '');
    setUrl(thisSection?.url || '');
  }, [thisSection]);

  // reset to modified site upon changes from state
  useEffect(() => {
    reset();
  }, [reset, site]);

  useEffect(() => {
    if (!enabled) {
      setUrl('');
    }
  }, [enabled]);

  // save the new site info
  const onSave = async () => {
    if (enabled && invalid) {
      return;
    }

    if (site) {
      // create the new section
      const newSection: ISiteSection = {
        enabled,
        content,
        url,
        props: {}
      };

      // save the new site
      await updateSite({
        ...site,
        sections: {
          ...site.sections,
          [section.name]: { ...newSection }
        }
      });
    }
  };

  // validation.  effect on values. Set invalid.
  useEffect(() => {
    var regExp = /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+$/;
    // only one for now
    setInvalid(enabled && !regExp.test(url));
  }, [url, enabled]);

  return (
    <ConsoleBody
      title={section.title}
      subTitle={section.description}
      invalid={invalid}
      saving={saving}
      onSave={() => onSave()}
      onCancel={() => reset()}>
      <div className="flex flex-col gap-8">
        <div className="flex gap-3">
          <div className="flex h-6 items-center">
            <input
              id="spotlightEnabled"
              name="spotlightEnabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>
          <div className="text-sm leading-6">
            <label htmlFor="spotlightEnabled" className="font-medium text-gray-900">
              Enable the section
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="spotlightContent" className="block text-sm font-medium leading-6 text-gray-900">
            Spotlight Introduction
          </label>
          <div className="">
            <textarea
              id="spotlightContent"
              name="spotlightContent"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!enabled}
              className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 
                ring-inset ring-gray-300 placeholder:text-gray-400 disabled:opacity-30
                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-600 flex gap-6">Introduce the spotlight video.</p>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="spotlightUrl" className="block text-sm font-medium leading-6 text-gray-900">
            YouTube Video URL
          </label>
          <div className="">
            <div
              className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 
              focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md relative">
              <input
                required
                disabled={!enabled}
                pattern="https?://.+"
                type="text"
                name="spotlightUrl"
                id="spotlightUrl"
                placeholder="Paste the URL from the embed code from YouTube share"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="peer disabled:opacity-30
                  block w-full rounded-md border-0 text-gray-900 invalid:text-red-900 shadow-sm py-1.5 pr-10 
                  ring-1 ring-inset ring-gray-300 invalid:ring-red-300 placeholder:text-gray-300 
                  focus:ring-2 focus:ring-inset focus:ring-indigo-600 invalid:focus:ring-red-500 sm:py-1.5 sm:text-sm sm:leading-6"
              />

              <div className="hidden peer-invalid:flex pointer-events-none absolute inset-y-0 right-0 items-center pr-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsoleBody>
  );
}
