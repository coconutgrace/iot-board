import {DashboardStore} from "../store";
import * as Widgets from "./widgets";
import {IPostMessage} from "../pluginApi/pluginTypes"
import Unsubscribe = Redux.Unsubscribe;


export class WidgetPluginInstance {
    private _iFrame: HTMLIFrameElement;
    private unsubscribeStore: Unsubscribe;
    private disposed = false;
    private oldWidgetState: any = null;
    private oldDatasourceData: {[id: string]: any} = {}

    constructor(private id: string, private store: DashboardStore) {
        if (typeof window !== 'undefined') {
            window.addEventListener('message',
                (e: MessageEvent) => {
                    if (!this._iFrame && e.origin === "null") {
                        console.log("Discarding message because iFrame not set yet", e.data)
                    }
                    if (this._iFrame !== undefined && e.origin === "null" && e.source === this._iFrame.contentWindow) {
                        this.handleMessage(e.data)
                    }
                });
        }

        this.unsubscribeStore = store.subscribe(() => {
            const state = store.getState()
            const widgetState = state.widgets[id];
            if (widgetState !== this.oldWidgetState) {
                this.oldWidgetState = widgetState;
                this.sendPluginState()
            }

            // Update datasource data in iFrame
            const widgetPluginState = state.widgetPlugins[widgetState.type];
            widgetPluginState.typeInfo.settings.filter(s => {
                return s.type === "datasource"
            }).map(s => {
                return widgetState.settings[s.id]
            }).forEach(dsId => {
                const data = state.datasources[dsId].data;
                if (data !== this.oldDatasourceData[dsId]) {
                    this.oldDatasourceData[dsId] = data;
                    this.sendDatasourceData(dsId);
                }
            });
        })
    }

    set iFrame(element: HTMLIFrameElement) {
        this._iFrame = element;
        this.sendMessage({type: "init"})
    }

    handleMessage(msg: IPostMessage) {
        switch (msg.type) {
            case 'init': {
                this.sendPluginState()
                break;
            }
            default:
                break;
        }
    }

    sendMessage(msg: any) {
        this._iFrame.contentWindow.postMessage(msg, '*')
    }

    sendPluginState() {
        const state = this.store.getState()
        const widgetState = state.widgets[this.id]
        this.sendMessage({
            type: "widgetState",
            payload: widgetState
        })
    }

    sendDatasourceData(dsId: string) {
        const state = this.store.getState()
        this.sendMessage({
            type: "data",
            payload: {
                id: dsId,
                data: state.datasources[dsId].data
            }
        })
    }


    updateSetting(widgetId: string, settingId: string, value: any) {
        console.log("update", settingId, "to", value, 'of', widgetId)
        this.store.dispatch(Widgets.updatedSingleSetting(widgetId, settingId, value));
    }

    dispose() {
        if (!this.disposed && _.isFunction(this.unsubscribeStore)) {
            this.unsubscribeStore();
        }
        this.disposed = true;
    }
}
