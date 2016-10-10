import "file?name=[name].[ext]!./widget.html";
import * as ReactDOM from 'react-dom'
import Widget from './widget.ui'
import * as React from "react";
import {ITypeInfo} from "../pluginApi/pluginTypes";
import {IWidgetPlugin} from "../widgets/widgetPluginFactory";

let widgetUrl = location.hash.replace(/#/, "");
console.log("URL: " + widgetUrl)

const pluginApi = {
    registerDatasourcePlugin: () => {console.error("Can not register datasource in Widget context")},
    registerWidgetPlugin: (typeInfo: ITypeInfo, widget: IWidgetPlugin) => {

    }
};

// TO be robust during tests in node and server side rendering
if (window) {
    (<any>window).iotDashboardApi = pluginApi;
}


const appElement = document.getElementById('widget');

ReactDOM.render(React.createElement(Widget), appElement)
