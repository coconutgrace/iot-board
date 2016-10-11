import {DashboardStore} from "../store";
import * as Widgets from "./widgets";
import {IPostMessage} from "../pluginApi/pluginTypes"
import Unsubscribe = Redux.Unsubscribe;


export class WidgetPluginInstance {
    private _iFrame: HTMLIFrameElement;
    private unsubscribeStore: Unsubscribe;
    private frameInitialized: boolean = false;
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
            if (!this.frameInitialized) {
                // We get invalid caches when we send state to the iFrame before it is ready
                return;
            }

            const state = store.getState()
            const widgetState = state.widgets[id];
            if (widgetState !== this.oldWidgetState) {
                this.oldWidgetState = widgetState;
                this.sendPluginState()
            }

            this.updateDatasourceDataInFrame()
        })
    }

    set iFrame(element: HTMLIFrameElement) {
        this._iFrame = element;
        this.sendMessage({type: "init"})
    }

    updateDatasourceDataInFrame() {
        const state = this.store.getState();
        const widgetState = state.widgets[this.id];
        const widgetPluginState = state.widgetPlugins[widgetState.type];
        widgetPluginState.typeInfo.settings.filter(s => {
            return s.type === "datasource"
        }).map(s => {
            return widgetState.settings[s.id]
        }).forEach(dsId => {
            if (state.datasources[dsId] === undefined) {
                return;
            }
            const data = state.datasources[dsId].data;
            if (data !== this.oldDatasourceData[dsId]) {
                this.oldDatasourceData[dsId] = data;
                this.sendDatasourceData(dsId);
            }
        });
    }

    handleMessage(msg: IPostMessage) {
        switch (msg.type) {
            case 'init': {
                this.frameInitialized = true;
                this.sendPluginState()
                this.updateDatasourceDataInFrame()
                break;
            }
            case 'updateSetting': {
                this.updateSetting(msg.payload.id, msg.payload.value)
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


    updateSetting(settingId: string, value: any) {
        console.log("update", settingId, "to", value, 'of', this.id)
        this.store.dispatch(Widgets.updatedSingleSetting(this.id, settingId, value));
    }

    dispose() {
        if (!this.disposed && _.isFunction(this.unsubscribeStore)) {
            this.unsubscribeStore();
        }
        this.disposed = true;
    }
}
