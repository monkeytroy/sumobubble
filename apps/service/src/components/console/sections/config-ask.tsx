import { useAppStore } from '@/src/store/app-store';
import { ChatBubbleOvalLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useCallback } from 'react';
import { ISection } from '@/src/components/console/types';
import { ConsoleBody } from '@/src/components/console/console-body';
import { SubscriptionStatus } from '@/src/models/customer';
import ConsolePricing from '@/src/components/console/console-pricing';
import { IAppProps } from '@/src/services/types';
import { uploadSourceDocument } from '@/src/services/source';

export const section: ISection = {
  name: 'chat',
  title: 'Ask AI',
  description: 'An AI powered chat feature based on document sources.',
  icon: <ChatBubbleOvalLeftIcon />,
  class: '',
  component: <ConfigChatbot />
};

export default function ConfigChatbot(props: IAppProps) {
  // site and editable values
  const site = useAppStore((state) => state.site);
  const customer = useAppStore((state) => state.customer);
  const askSources = useAppStore((state) => state.askSources);
  const refreshAskSources = useAppStore((state) => state.refreshAskSources);
  const updateSite = useAppStore((state) => state.updateSite);
  const saving = useAppStore((state) => state.saving);

  // setup local state for editing.
  const [enabled, setEnabled] = useState(false);
  const chatbot = site?.chatbot;

  // local component state
  const [invalid, setInvalid] = useState(false);

  // reset to site state
  const reset = useCallback(() => {
    setEnabled(!!chatbot?.enabled);
  }, [chatbot]);

  // reset to modified site upon changes from state
  useEffect(() => {
    reset();
  }, [reset, site]);

  const onSave = async () => {
    setInvalid(false);

    if (site) {
      // copy configuration
      const newSite = JSON.parse(JSON.stringify(site));

      // replace.
      newSite.chatbot.enabled = enabled;

      // save!
      await updateSite(newSite);
    }
  };

  // const validateChatSiteUrl = (url: string) => {
  //   setChatsite(url);
  //   if (url) {
  //     var regExp = /^(https)?(\:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^!=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])+$/;
  //     setInvalid(!regExp.test(url));
  //   }
  // };

  const processFile = async (files: FileList | null) => {
    if (files?.length && site?._id) {
      await uploadSourceDocument(site?._id, files);

      // todo repace with async update of file status
      refreshAskSources();
    }
  };

  return (
    <ConsoleBody
      full={true}
      title={section.title}
      subTitle={section.description}
      invalid={invalid}
      saving={saving}
      saveOff={customer?.subscription?.status != SubscriptionStatus.Active}
      onSave={() => onSave()}
      onCancel={() => reset()}>
      <div className="">
        {customer?.subscription?.status != SubscriptionStatus.Active && (
          <div className="text-lg text-gray-600 mt-4 flex flex-col gap-4">
            Subscribe to configure and enable Ask AI.
            <div className="">
              <ConsolePricing {...props} startClosed={true}></ConsolePricing>
            </div>
          </div>
        )}

        {customer?.subscription?.status == SubscriptionStatus.Active && !customer?.subscription?.metadata?.chatbot && (
          <div
            className="mt-12 py-8 text-2xl text-gray-600 flex flex-col gap-8 text-center
            rounded-lg bg-gray-100">
            Your subscription does not support Ask AI. Would you like to upgrade?
            <div className="text-xl">
              <a href="mailto:support@sumobubble.com">Contact us</a>
            </div>
          </div>
        )}

        {customer?.subscription?.status == SubscriptionStatus.Active && customer?.subscription?.metadata?.chatbot && (
          <div className="flex flex-col gap-8">
            <div className="flex gap-3">
              <div className="flex h-6 items-center">
                <input
                  id="askAiEnabled"
                  name="askAiEnabled"
                  type="checkbox"
                  disabled={false}
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
              </div>
              <div className="text-sm leading-6">
                <label htmlFor="askAiEnabled" className="font-medium text-gray-900">
                  Enable this section
                </label>
              </div>
            </div>

            {askSources.length === 0 && (
              <div className="flex flex-col gap-3">
                <div className="mx-6">
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <div className="text-sm text-blue-700">
                          The chatbot needs documents with information used to answer questions. Upload one or more
                          documents to make chatbot active.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="spotlightUrl" className="text-sm font-medium leading-6 text-gray-900">
                Upload a source document for Ask AI
              </label>
              <div className="flex gap-3">
                <div className="font-[sans-serif] min-w-96">
                  <input
                    type="file"
                    name="uploadDoc"
                    id="uploadDoc"
                    aria-invalid={invalid}
                    onChange={(e) => processFile(e.target.files)}
                    className="w-full text-gray-400 font-semibold text-sm bg-white border 
                    file:cursor-pointer cursor-pointer file:border-0 file:py-3 file:px-4 
                    file:mr-4 file:bg-gray-100 file:hover:bg-gray-200 file:text-gray-500 rounded"
                  />
                  <p className="text-xs text-gray-400 mt-2">TXT only for now.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-semibold leading-6 text-gray-900">Source Files</div>
              <div className="text-gray-600">
                {askSources &&
                  askSources.map((v) => (
                    <div key={v._id} className="py-2 border-t border-gray-300">
                      {v.origFilename}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ConsoleBody>
  );
}
