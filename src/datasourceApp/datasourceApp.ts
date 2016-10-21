import "expose?_!lodash";
import "file?name=[name].[ext]!./datasource.html";
import * as React from "react";
import {ITypeInfo, IDatasourceClass} from "../pluginApi/pluginTypes";
import {FrameDatasourceInstance} from "./frameDatasourceInstance";


let datasourceUrl = location.hash.replace(/#/, "");

let pluginInstance = new FrameDatasourceInstance(datasourceUrl);

const pluginApi = {
    registerDatasourcePlugin: (typeInfo: ITypeInfo, datasourceClass: IDatasourceClass) => {
        pluginInstance.initialSetTypeInfo(typeInfo);
        pluginInstance.initialSetDatasourceClass(datasourceClass);
    },
    registerWidgetPlugin: () => {
        console.error("Can not register widget in datasource context")
    }
};

// TO be robust during tests in node and server side rendering
if (window) {
    (<any>window).iotDashboardApi = pluginApi;
}
