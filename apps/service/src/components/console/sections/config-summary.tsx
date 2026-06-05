import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/src/store/app-store';
import { Editor } from '@tinymce/tinymce-react';
import { saveFile } from '@/src/services/file';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ISection } from '@/src/components/console/types';
import { ConsoleBody } from '@/src/components/console/console-body';

export const section: ISection = {
  name: 'summary',
  title: 'Summary',
  description: 'Summary info displayed when app is opened',
  icon: <InformationCircleIcon />,
  class: '',
  component: <ConfigSummary />
};

export default function ConfigSummary() {
  // site and editable values
  const site = useAppStore((state) => state.site);
  const updateSite = useAppStore((state) => state.updateSite);
  const saving = useAppStore((state) => state.saving);

  const [enabled, setEnabled] = useState(false);
  const [content, setContent] = useState('');
  const [special, setSpecial] = useState('');

  // local component state
  const [newSummary, setNewSummary] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const editorRef = useRef({} as any);

  // reset to site state
  const reset = useCallback(() => {
    setEnabled(!!site?.summary?.enabled);
    setContent(site?.summary?.content || '');
    setNewSummary(site?.summary?.content || '');
    setSpecial(site?.summary?.special || '');
  }, [site]);

  // reset to modified site upon changes from state
  useEffect(() => {
    reset();
  }, [reset, site]);

  // save the new site info
  const onSave = async () => {
    if (site) {
      await updateSite({ ...site, summary: { enabled, content: newSummary, special } });
    }
  };

  // validation.  effect on values. Set invalid.
  useEffect(() => {
    setInvalid(enabled && newSummary.length === 0);
  }, [enabled, content, newSummary]);

  // image upload not currently activated
  const onImagesUpload = (blobInfo: { blob: () => Blob }) =>
    new Promise<string>(async (resolve, reject) => {
      const res = await saveFile(site?.customerEmail || 'unknown', blobInfo.blob());

      if (res.success) {
        resolve(res.data.url);
      } else {
        reject('Oh no!');
      }
    });

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

        <div className="h-160 flex flex-col">
          <label htmlFor="summary" className="block text-sm font-medium leading-6 text-gray-900">
            Summary - Summary text
          </label>

          <div
            className={
              'mt-2 grow w-full rounded-xl h-full ' +
              (enabled && invalid ? 'border-2 border-red-300' : '') +
              (!enabled ? 'select-none' : '')
            }>
            {(summaryLoading || !enabled) && (
              <div
                role="status"
                className="relative h-full flex flex-col gap-4 animate-pulse border-2 border-gray-200 p-4 rounded-lg">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px]"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>

                {enabled && summaryLoading && <span className="absolute inset-1/2 -mx-6 text-gray-500">Loading</span>}
              </div>
            )}

            {enabled && (
              <Editor
                id="summaryEditor"
                tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                onInit={(evt, editor) => {
                  setSummaryLoading(false);
                  editorRef.current = editor;
                }}
                initialValue={content}
                onEditorChange={(newValue) => setNewSummary(newValue)}
                //onDirty={() => setDirty(true)}  // content changed.. needed?
                init={{
                  images_upload_handler: onImagesUpload,
                  resize: false,
                  height: '100%',
                  statusbar: false,
                  menu: {
                    file: { title: 'File', items: '' },
                    edit: {
                      title: 'Edit',
                      items: 'undo redo | cut copy paste pastetext | selectall | searchreplace code'
                    },
                    view: { title: 'View', items: '' }, // code visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments
                    insert: {
                      title: 'Insert',
                      items:
                        'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime'
                    },
                    format: {
                      title: 'Format',
                      items:
                        'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat'
                    },
                    tools: { title: 'Tools', items: '' }, // a11ycheck spellcheckerlanguage spellchecker
                    table: {
                      title: 'Table',
                      items: 'inserttable | cell row column | advtablesort | tableprops deletetable'
                    },
                    help: { title: 'Help', items: 'help' } // help
                  },
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'emoticons'
                  ],
                  toolbar:
                    'undo redo | blocks | ' +
                    'bold italic forecolor emoticons | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent '
                  //'image media | removeformat code | help'
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="special" className="block text-sm font-medium leading-6 text-gray-900">
            Special - A highlighted special announcement
          </label>
          <div className="">
            <textarea
              disabled={!enabled}
              id="special"
              name="special"
              rows={3}
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 
                ring-inset ring-gray-300 placeholder:text-gray-400 disabled:opacity-50
                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>
    </ConsoleBody>
  );
}
