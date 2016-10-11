declare module "react-dom-server" {
    import { ReactElement } from 'react';

    function renderToString(element: ReactElement<any>): string;
    function renderToStaticMarkup(element: ReactElement<any>): string;
    const version: string;
}
