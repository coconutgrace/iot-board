import {IWidgetState, ITypeInfo, IPostMessage, IWidgetProps, IDatasourceClass, IDatasourceState, IDatasourcePlugin} from "../pluginApi/pluginTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as URI from "urijs";
import ScriptLoader from "../util/scriptLoader";

export class FrameDatasourceInstance {
    typeInfo: ITypeInfo;
    datasourceClass: IDatasourceClass
    datasourceInstance: IDatasourcePlugin

    datasourceState: IDatasourceState;
    data: any[] = [];

    constructor(url: string) {

        window.addEventListener('message',
            (e: MessageEvent) => {
                this.handleMessage(e.data as IPostMessage)
            });

        ScriptLoader.loadScript([url])
            .then(() => {
                if (this.typeInfo === undefined) {
                    throw new Error("Plugin typeInfo not available, did you called registerDatasourcePlugin(...)?")
                }
                return this.loadPluginScriptDependencies(this.typeInfo, url)
            })
            .then(() => {
                this.datasourceInstance = new this.datasourceClass()
                this.sendMessage({type: "init"});
            })
            .catch((e: Error) => {
                console.error("Failed to load datasource plugin from URL", url, e)
            })
    }

    sendMessage(msg: IPostMessage) {
        window.parent.postMessage(msg, '*');
    }

    handleMessage(msg: IPostMessage) {
        try {
            switch (msg.type) {
                case "datasourceState": {
                    this.datasourceState = msg.payload;
                    break;
                }
                case "fetchData": {
                    // TODO: Implement data fetching API here
                    break;
                }
                default:
                    console.log("frame got unknown message", msg)
                    break;
            }
        } catch (e) {
            console.error("Failed to handle message", e)
        }
    }

    private loadPluginScriptDependencies(typeInfo: ITypeInfo, url: string): Promise<any> {

        const dependencies: string[] = typeInfo.dependencies;
        if (_.isArray(dependencies) && dependencies.length !== 0) {
            const dependencyPaths = dependencies.map(dependency => {
                return URI(dependency).absoluteTo(url).toString();
            });

            console.log("Loading Dependencies for Plugin", dependencyPaths);
            return ScriptLoader.loadScript(dependencyPaths);
        }
        else {
            return Promise.resolve();
        }
    }
}
