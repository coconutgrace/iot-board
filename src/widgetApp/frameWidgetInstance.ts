import {IWidgetState, ITypeInfo, IPostMessage, IWidgetProps, MESSAGE_STATE, MESSAGE_DATA, MESSAGE_UPDATE_SETTING, MESSAGE_INIT} from "../pluginApi/pluginTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as URI from "urijs";
import ScriptLoader from "../util/scriptLoader";

export class FrameWidgetInstance {
    private typeInfo: ITypeInfo;
    private widgetComponent: React.ComponentClass<IWidgetProps>;

    private widgetState: IWidgetState;
    private data: {[dsId: string]: any[]} = {};


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
                this.sendMessage({type: MESSAGE_INIT});
            })
            .catch((e: Error) => {
                console.error("Failed to load widget plugin from URL", url, e)
            })


    }

    initialSetTypeInfo(typeInfo: ITypeInfo) {
        if (this.typeInfo !== undefined) {
            throw new Error("Can not change typeInfo after it was set");
        }
        this.typeInfo = typeInfo;
    }

    initialSetWidgetComponent(widgetComponent: React.ComponentClass<IWidgetProps>) {
        if (this.widgetComponent !== undefined) {
            throw new Error("Can not change widgetComponent after it was set");
        }
        this.widgetComponent = widgetComponent;
    }

    private sendMessage(msg: IPostMessage) {
        window.parent.postMessage(msg, '*');
    }

    private handleMessage(msg: IPostMessage) {
        try {
            switch (msg.type) {
                case MESSAGE_STATE: {
                    this.widgetState = msg.payload;
                    this.render()
                    break;
                }
                case MESSAGE_DATA: {
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


    private render() {
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
                    type: MESSAGE_UPDATE_SETTING,
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
