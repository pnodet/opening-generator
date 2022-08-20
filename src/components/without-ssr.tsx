import dynamic from 'next/dynamic';
import React from 'react';

type Props = {children: React.ReactNode};

/* eslint-disable-next-line react/jsx-no-useless-fragment */
const WithoutSsr = ({children}: Props) => <>{children}</>;

export default dynamic(async () => WithoutSsr, {ssr: false});
