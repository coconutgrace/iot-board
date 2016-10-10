import "expose?$!expose?jQuery!jquery";
import "expose?React!react";
import "expose?_!lodash";
import "expose?c3!c3";
import "file?name=[name].[ext]!./widget.html";
import * as ReactDOM from 'react-dom'
import Widget from './widget.ui'
import * as React from "react";
import {ITypeInfo, IWidgetState} from "../pluginApi/pluginTypes";
import ScriptLoader from "../util/scriptLoader";

let widgetUrl = location.hash.replace(/#/, "");
console.log("URL: " + widgetUrl)

window.parent.postMessage("hello parent", '*');

window.addEventListener('message',
    function (e: MessageEvent) {
        console.log('iFrame received: ' + e.data + ' from origin: ' + e.origin);
    });

const appElement = document.getElementById('widget');

export interface GetDataFunction {
    (dsId: string): any[]
}

export interface IWidgetProps {
    state?: IWidgetState | any
    getData?: GetDataFunction
    updateSetting?: (settingId: string, value: any) => void
}

const pluginApi = {
    registerDatasourcePlugin: () => {
        console.error("Can not register datasource in Widget context")
    },
    registerWidgetPlugin: (typeInfo: ITypeInfo, widget: React.ComponentClass<IWidgetProps>) => {
        // TODO: Store instance to dispose?

        ReactDOM.render(React.createElement(widget, {
            getData: (dsId: string): any[] => {
                return []
            },
            state: {
                height: 200
            },
            updateSetting: (settingId: string, value: any): void => {
                return;
            }
        }), appElement);
    }
};

// TO be robust during tests in node and server side rendering
if (window) {
    (<any>window).iotDashboardApi = pluginApi;
}


ReactDOM.render(React.createElement(Widget), appElement)

ScriptLoader.loadScript([widgetUrl])
    .then(() => {
        console.log("loaded: " + widgetUrl)
        // nothing
    })
