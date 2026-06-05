import { ReactElement } from 'react';

export interface ISection {
  name: string;
  title: string;
  description: string;
  icon: ReactElement;
  class: string;
  component: ReactElement;
}

export interface IConsoleHeadingProps {
  title: string;
  subTitle?: string;
  saving: boolean;
  invalid: boolean;
  saveOff?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Module only interface for props
 */
export interface IConsoleBodyProps extends IConsoleHeadingProps {
  children: ReactElement;
  full?: boolean;
}
