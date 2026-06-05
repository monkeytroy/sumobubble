import { useAppStore } from '@/src/store/app-store';
import { ExclamationCircleIcon, MinusCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useCallback } from 'react';
import { ISection } from '@/src/components/console/types';
import { ConsoleBody } from '@/src/components/console/console-body';
import { IContactCategory, ISiteSection } from '@/src/models/site';

export const section: ISection = {
  name: 'inforequest',
  title: 'Info Request',
  description: 'Configurable information requests.',
  icon: <StarIcon />,
  class: '',
  component: <ConfigInfoRequest />
};

export default function ConfigInfoRequest() {
  // site and editable values
  const site = useAppStore((state) => state.site);
  const updateSite = useAppStore((state) => state.updateSite);
  const saving = useAppStore((state) => state.saving);
  const thisSection: ISiteSection | undefined = site?.sections[section.name];

  // setup local state for editing.
  const [enabled, setEnabled] = useState(false);
  const [content, setContent] = useState('');
  const [email, setEmail] = useState([] as Array<string>);
  const [categories, setCategories] = useState([] as Array<IContactCategory>);

  // local component state
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryEmail, setNewCategoryEmail] = useState('');
  const [invalid, setInvalid] = useState(false);

  // reset to site state
  const reset = useCallback(() => {
    setEnabled(!!thisSection?.enabled);
    setContent(thisSection?.content || '');
    setEmail(thisSection?.props?.email || []);
    setCategories(thisSection?.props?.categories || []);
  }, [thisSection]);

  // reset to modifed site upon changes from state
  useEffect(() => {
    reset();
  }, [reset, site]);

  // save the new site info
  const onSave = async () => {
    setInvalid(false);
    if (enabled && !email) {
      setInvalid(true);
      return;
    }

    if (site) {
      // create the new section
      const newSection: ISiteSection = {
        enabled,
        content,
        props: {
          email,
          categories: Array.from(categories)
        }
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
    setInvalid(enabled && email.length == 0);
  }, [email, enabled]);

  /**
   * Add a new category duh
   * @returns
   */
  const addNewCategory = () => {
    if (!newCategory || !newCategoryEmail || categories.filter((cat) => cat.title === newCategory).length == 1) {
      // todo show some error
      return;
    }

    setCategories([
      ...categories,
      {
        title: newCategory,
        email: newCategoryEmail
      }
    ]);

    setNewCategory('');
    setNewCategoryEmail('');
  };

  const removeCategory = (catTitle: string) => {
    setCategories(categories.filter((cat) => cat.title !== catTitle));
  };

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
              id="sectionEnabled"
              name="sectionEnabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>
          <div className="text-sm leading-6">
            <label htmlFor="comments" className="font-medium text-gray-900">
              Enable this section
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="contact" className="block text-sm font-medium leading-6 text-gray-900">
            Invitation - A message to your users.
          </label>
          <div className="">
            <textarea
              id="content"
              name="content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={!enabled}
              className="disabled:opacity-30
                block w-full rounded-md border-0 text-gray-900 shadow-sm 
                ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
            Default email address - Used if a category is not selected by the user.
          </label>
          <div className="relative">
            <input
              required
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value ? [e.target.value.trim()] : [])}
              disabled={!enabled}
              placeholder="you@example.com"
              aria-invalid={invalid}
              aria-describedby="email-error"
              autoComplete="email"
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

        <div className="flex flex-col gap-3">
          <label htmlFor="contact" className="block text-sm font-medium leading-6 text-gray-900">
            Categories
          </label>

          <div
            className="rounded-md border border-gray-300 shadow-sm 
            flex flex-wrap divide-x divide-gray-300">
            <div className="p-4 flex flex-col gap-3 w-1/2 min-w-fit">
              <div className="flex flex-col gap-3">
                <label htmlFor="catName" className="block text-sm font-medium leading-6 text-gray-900">
                  Category
                </label>
                <div className="">
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    disabled={!enabled}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                      ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 disabled:opacity-30
                      focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Target email address
                </label>
                <div className="">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={newCategoryEmail}
                    onChange={(e) => setNewCategoryEmail(e.target.value)}
                    disabled={!enabled}
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm 
                      ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 disabled:opacity-30
                      focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addNewCategory}
                disabled={!enabled}
                className="rounded-md bg-indigo-600 p-1 text-white shadow-sm 
                  hover:bg-indigo-500 focus-visible:outline disabled:opacity-30
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                Add
              </button>
            </div>

            <div className="p-4 flex flex-col">
              <label htmlFor="contact" className="block text-sm font-medium leading-6 text-gray-900">
                Selected Categories ({categories.length})
              </label>

              <ul role="list" className="">
                {categories.length == 0 && (
                  <div className="opacity-30 flex py-2">
                    <button
                      type="button"
                      className="rounded-full text-gray-600
                        focus-visible:bg-indigo-200 focus-visible:ring-0 focus-visible:ring-offset-0
                        focus-visible:outline-0">
                      <MinusCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Some Category</p>
                      <p className="text-sm text-gray-500">someone@somewhere.com</p>
                    </div>
                  </div>
                )}
                {categories.map((cat) => (
                  <li key={cat.title} className="flex py-2">
                    <button
                      type="button"
                      onClick={() => removeCategory(cat.title)}
                      disabled={!enabled}
                      className="rounded-full text-gray-600 disabled:opacity-30
                        focus-visible:bg-indigo-200 focus-visible:ring-0 focus-visible:ring-offset-0
                        focus-visible:outline-0">
                      <MinusCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{cat.title}</p>
                      <p className="text-sm text-gray-500">{cat.email}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ConsoleBody>
  );
}
