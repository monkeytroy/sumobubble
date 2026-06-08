'use client';

import React, { ReactElement } from 'react';
import { sections } from '@/src/components/console/sections/sections';
import { IAppProps } from '@/src/services/types';

interface Props {
  section: string;
  stripe: IAppProps['stripe'];
}

export default function SectionRenderer({ section, stripe }: Props) {
  const child = sections.find((val) => val.name.toLowerCase() === section)?.component as
    | ReactElement<IAppProps>
    | undefined;
  if (!child) return null;
  return <div>{React.cloneElement(child, { stripe })}</div>;
}
