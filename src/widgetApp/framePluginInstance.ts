import {IWidgetState, ITypeInfo, IPostMessage, IWidgetProps} from "../pluginApi/pluginTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as URI from "urijs";
import ScriptLoader from "../util/scriptLoader";

export class FramePluginInstance {
    widgetState: IWidgetState;
    data: {[dsId: string]: any[]} = {};
    typeInfo: ITypeInfo;
    widgetComponent: React.ComponentClass<IWidgetProps>;

    constructor(url: string, private appElement: Element) {

        window.addEventListener('message',
            (e: MessageEvent) => {
                this.handleMessage(e.data as IPostMessage)
            });

        ScriptLoader.loadScript([url])
            .then(() => {
                if (this.typeInfo === undefined) {
                    throw new Error("Plugin typeInfo not available, did you called registerWidgetPlugin(...)?")
                }
                return this.loadPluginScriptDependencies(this.typeInfo, url)
            })
            .then(() => {
                this.sendMessage({type: "init"});
            })
            .catch((e: Error) => {
                console.error("Failed to load widget plugin from URL", url, e)
            })


    }

    sendMessage(msg: IPostMessage) {
        window.parent.postMessage(msg, '*');
    }

    handleMessage(msg: IPostMessage) {
        try {
            switch (msg.type) {
                case "widgetState": {
                    this.widgetState = msg.payload;
                    this.render()
                    break;
                }
                case "data": {
                    this.data[msg.payload.id] = msg.payload.data;
                    this.render()
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


    render() {
        if (this.widgetState === undefined) {
            // Do not render when we have no state
            return;
        }

        ReactDOM.render(React.createElement(this.widgetComponent, {
            // getData for Backwards compatibility
            // TODO: Update docu so people access props.data[dsId] directly
            getData: (dsId: string): any[] => {
                if (this.data === undefined || this.data[dsId] === undefined) {
                    return []
                }
                return this.data[dsId]
            },
            state: this.widgetState,
            data: this.data,
            updateSetting: (settingId: string, value: any): void => {
                this.sendMessage({
                    type: "updateSetting",
                    payload: {
                        id: settingId,
                        value: value
                    }
                })
                // TODO: Implement
                return;
            }
        }), this.appElement);
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
