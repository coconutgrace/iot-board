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
    private messageListener: any;

    constructor(private id: string, private store: DashboardStore) {
        if (typeof window !== 'undefined') {

            this.messageListener = (e: MessageEvent) => {
                if (this.disposed) {
                    // TODO: better unit test than runtime checking
                    console.error("Message listener called but WidgetPluginInstance is already disposed")
                    return;
                }
                if (!this._iFrame && e.origin === "null") {
                    console.log("Discarding message because iFrame not set yet", e.data)
                }
                if (this._iFrame !== undefined && e.origin === "null" && e.source === this._iFrame.contentWindow) {
                    this.handleMessage(e.data)
                }
            };
            window.addEventListener('message', this.messageListener);
        }

        this.unsubscribeStore = store.subscribe(() => {
            if (this.disposed) {
                // TODO: better unit test than runtime checking
                console.error("Store change observed but WidgetPluginInstance is already disposed")
                return;
            }
            if (!this.frameInitialized) {
                // We get invalid caches when we send state to the iFrame before it is ready
                return;
            }

            const state = store.getState()
            const widgetState = state.widgets[id];
            if (widgetState === undefined) {
                // This happens for example during import. Where the state is cleared but this class not yet disposed.
                // So we just silently return.
                return;
            }

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
        if (!this._iFrame.contentWindow) {
            // This happens during import. We ignore it silently and rely on later disposal to free memory.
            // TODO: Find a way to dispose this instance before this happens.
            return;
        }
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
        this.store.dispatch(Widgets.updatedSingleSetting(this.id, settingId, value));
    }

    dispose() {
        if (!this.disposed && _.isFunction(this.unsubscribeStore)) {
            this.unsubscribeStore();
        }
        if (!this.disposed && _.isFunction(this.messageListener)) {
            window.removeEventListener("message", this.messageListener)
        }

        this.disposed = true;
    }
}
