import "expose?$!expose?jQuery!jquery";
import "expose?React!react";
import "expose?_!lodash";
import "file?name=[name].[ext]!./widget.html";
import * as React from "react";
import {ITypeInfo, IWidgetProps} from "../pluginApi/pluginTypes";
import {FramePluginInstance} from "./framePluginInstance";


let widgetUrl = location.hash.replace(/#/, "");
const appElement = document.getElementById('widget');

let pluginInstance = new FramePluginInstance(widgetUrl, appElement);

const pluginApi = {
    registerDatasourcePlugin: () => {
        console.error("Can not register datasource in Widget context")
    },
    registerWidgetPlugin: (typeInfo: ITypeInfo, widget: React.ComponentClass<IWidgetProps>) => {
        pluginInstance.typeInfo = typeInfo;
        pluginInstance.widgetComponent = widget;
    }
};

// TO be robust during tests in node and server side rendering
if (window) {
    (<any>window).iotDashboardApi = pluginApi;
}
