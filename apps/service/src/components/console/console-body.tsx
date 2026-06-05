import ConsoleHeading from './console-heading';
import { IConsoleBodyProps } from './types';

export function ConsoleBody(props: IConsoleBodyProps) {
  let classes = 'max-w-xl w-full select-none';
  if (props.full) {
    classes = 'w-full select-none';
  }

  return (
    <div className="w-full">
      <ConsoleHeading {...props} />

      <div className={classes}>{props.children}</div>
    </div>
  );
}
