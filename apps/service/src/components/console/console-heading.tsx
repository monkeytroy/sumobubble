import { IConsoleHeadingProps } from './types';

export default function ConsoleHeading(props: IConsoleHeadingProps) {
  return (
    <div
      className="border-b border-gray-200 py-4 mb-4
      sm:flex sm:items-center sm:justify-between">
      <div className="flex gap-4 items-baseline">
        <span className="text-xl font-semibold text-gray-900">{props.title}</span>
        <span className="text-sm text-gray-600">{props.subTitle}</span>
      </div>
      {!props?.saveOff && (
        <div className="mt-3 sm:ml-4 sm:mt-0 flex gap-4 items-baseline">
          {props.invalid && <div className="text-red-600 text-sm">Fix invalid entries</div>}
          <button
            type="reset"
            disabled={props.saving || props.invalid}
            onClick={props.onCancel}
            className="text-sm font-semibold leading-6 text-gray-900 disabled:opacity-25">
            Reset
          </button>
          <button
            type="submit"
            disabled={props.saving || props.invalid}
            onClick={props.onSave}
            className="rounded-md bg-blue-500 py-2 px-3 text-sm font-semibold 
              text-white shadow-sm hover:bg-blue-600 disabled:opacity-25
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            Save
          </button>
        </div>
      )}
    </div>
  );
}
