import { useAppStore } from '@/src/store/app-store';
import { CogIcon } from '@heroicons/react/24/outline';
import { ISection } from '@/src/components/console/types';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { TwitterPicker } from 'react-color';
import { ConsoleBody } from '@/src/components/console/console-body';
import { SubscriptionStatus } from '@/src/models/customer';
import { IAppProps } from '@/src/services/types';

import ConsolePricing from '@/src/components/console/console-pricing';
import { COLORS } from '@/src/constants/colors';
import { DEFAULT_THEME_COLOR, TITLE_LEN_MIN, TITLE_LEN_MAX } from '@/src/constants/site-deafults';

export const section: ISection = {
  name: 'setup',
  title: 'Site Setup',
  description: 'Name, setup, and deploy this site.',
  icon: <CogIcon></CogIcon>,
  class: '',
  component: <ConfigSetup />
};

export default function ConfigSetup(props: IAppProps) {
  // site and editable values
  const site = useAppStore((state) => state.site);
  const customer = useAppStore((state) => state.customer);
  const updateSite = useAppStore((state) => state.updateSite);
  const saving = useAppStore((state) => state.saving);

  const [title, setTitle] = useState('');
  const [themePrimary, setThemePrimary] = useState(DEFAULT_THEME_COLOR);
  const [button, setButton] = useState('');

  // local component state
  const [showPickColor, setShowPickColor] = useState(false);
  const [invalid, setInvalid] = useState(false);

  // reset to site state
  const reset = useCallback(() => {
    setButton(site?.button || '');
    setTitle(site?.title || '');
    setThemePrimary(site?.theme?.primary || DEFAULT_THEME_COLOR);
  }, [site]);

  // reset to modified site upon changes from state
  useEffect(() => {
    reset();
  }, [reset, site]);

  // save the new site info.
  const onSave = async () => {
    if (site) {
      await updateSite({ ...site, title: title, theme: { primary: themePrimary }, button });
    }
  };

  // validation.  effect on values. Set invalid.
  useEffect(() => {
    setInvalid(title.length < TITLE_LEN_MIN || title.length > TITLE_LEN_MAX);
  }, [title]);

  // more component support.

  // set theme when color is changed.
  const themeSelect = (color: { hex: string }) => {
    setThemePrimary(color.hex);
    setShowPickColor(false);
  };

  return (
    <ConsoleBody
      title="Setup"
      subTitle="Get your site setup"
      invalid={invalid}
      saving={saving}
      onSave={() => onSave()}
      onCancel={() => reset()}>
      <div className="divide-y divide-gray-300">
        <div className="flex flex-col gap-4 pb-8">
          <div className="flex gap-4 ">
            <div className="flex-grow mb-4">
              <div className="flex flex-col">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                  Site Title
                </label>
                <div className="mt-2">
                  <input
                    required
                    title="Site title requires 4 or more characters."
                    minLength={TITLE_LEN_MIN}
                    maxLength={TITLE_LEN_MAX}
                    aria-invalid={invalid}
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="peer disabled:opacity-30
                      block w-full rounded-md border-0 text-gray-900 
                      invalid:text-red-900 shadow-sm py-1.5 pr-10
                      ring-1 ring-inset ring-gray-300 invalid:ring-red-300 placeholder:text-gray-300
                      focus:ring-2 focus:ring-inset focus:ring-indigo-600 
                      invalid:focus:ring-red-300 sm:py-1.5 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col">
                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                  Theme Color
                </label>
                <div className="mt-2 relative">
                  <div
                    className="w-24 h-9 rounded-md"
                    style={{ backgroundColor: themePrimary }}
                    onClick={() => setShowPickColor(!showPickColor)}></div>
                  {showPickColor && (
                    <div className="z-50 absolute mt-2 p-4 bg-gradient-to-t from-gray-100 bg-gray-50 border-gray-200 shadow-md shadow-gray-500 rounded-lg ">
                      <TwitterPicker onChangeComplete={themeSelect} colors={COLORS}></TwitterPicker>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Button Style</label>
            <p className="text-sm text-gray-500">How would you like SumoBubble button to appear?</p>
            <fieldset className="mt-4">
              <legend className="sr-only">Select</legend>
              <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="buttonCircle"
                    name="notification-method"
                    type="radio"
                    defaultChecked={button == 'circleRight'}
                    onClick={() => setButton('circleRight')}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="buttonCircle" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                    Circle Button
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="buttonRight"
                    name="notification-method"
                    type="radio"
                    defaultChecked={button == '' || button == 'right'}
                    onClick={() => setButton('right')}
                    className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label htmlFor="buttonRight" className="ml-3 block text-sm font-medium leading-6 text-gray-900">
                    Right Edge
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-8">
          {customer?.subscription?.status != SubscriptionStatus.Active && (
            <div className="text-lg text-gray-600 mt-4 flex flex-col gap-4">
              Subscribe to deploy SumoBubble to your webiste.
              <div className="">
                <ConsolePricing {...props} startClosed={true}></ConsolePricing>
              </div>
            </div>
          )}
          {customer?.subscription?.status == SubscriptionStatus.Active && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-4 items-baseline">
                <span className="text-xl font-semibold text-gray-900">Deploy Using Code</span>
              </div>
              <div className="block text-sm font-medium leading-6 text-gray-900">
                Copy and paste this into your webpage!
              </div>
              <div className="bg-gray-300 rounded-lg shadow-md p-6 select-text break-all whitespace-pre-wrap">
                <code>
                  {`
<script 
  type="module"
  src="${process.env.NEXT_PUBLIC_SCRIPT_URL}"
  id="sumobubble-scriptastic"
  async>
</script>
<sumobubble-wc site="${site?._id}">
</sumobubble-wc>
                  `}
                </code>
              </div>

              <div className="flex gap-4 items-baseline mt-6">
                <span className="text-xl font-semibold text-gray-900">Deploy to Wix</span>
              </div>

              <div className="block text-sm font-medium leading-6 text-gray-900">
                <ol>
                  <li>1. Create a Custom Element on your page. Choose Source will be selected.</li>
                  <li>
                    2. In the Element Attributes choose Server Url and enter:
                    <div className="ml-4">
                      <b>{process.env.NEXT_PUBLIC_SCRIPT_URL}</b>
                    </div>
                  </li>
                  <li>3. Scroll down and enter the Tag name as: sumobubble-wc</li>
                  <li>4. Select the element option Set Attributes, then add a new attribute.</li>
                  <li>
                    5. Make the Attribute Name: <b>site</b> and the Value: <b>{site?._id}</b>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConsoleBody>
  );
}
