/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {DashboardStore} from "../store";
import * as Datasource from "./datasource";
import * as DatasourceData from "./datasourceData";
import {IPostMessage, IDatasourceState, MESSAGE_STATE, MESSAGE_INIT, MESSAGE_INITIAL_STATE, MESSAGE_DATA} from "../pluginApi/pluginTypes";
import Unsubscribe = Redux.Unsubscribe;

/**
 * Represents a plugin instance, state should be saved in store!
 */
export class DatasourcePluginInstance {

    iFrame: HTMLIFrameElement;
    private oldDsState: IDatasourceState = null;
    private frameInitialized: boolean = false;
    private messageListener: any;
    private unsubscribeStore: Unsubscribe;
    private disposed = false;


    constructor(public id: string, private store: DashboardStore) {
        if (typeof window !== 'undefined') {

            this.messageListener = (e: MessageEvent) => {
                if (this.disposed) {
                    // TODO: better unit test than runtime checking
                    console.error("Message listener called but WidgetPluginInstance is already disposed")
                    return;
                }
                if (!this.iFrame && e.origin === "null") {
                    console.log("Discarding message because iFrame not set yet", e.data)
                }
                if (this.iFrame !== undefined && e.origin === "null" && e.source === this.iFrame.contentWindow) {
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
            const dsState = state.datasources[id];
            if (dsState === undefined) {
                // This happens for example during import. Where the state is cleared but this class not yet disposed.
                // So we just silently return.
                return;
            }

            if (dsState !== this.oldDsState) {
                console.log("old state: ", this.oldDsState)
                this.oldDsState = dsState;
                console.log("old state: ", this.oldDsState)
                this.sendDatasourceState()
            }
        })
    }

    get state() {
        const state = this.store.getState();
        const dsState = state.datasources[this.id];

        if (!dsState) {
            throw new Error("Can not get state of non existing datasource with id " + this.id);
        }

        return dsState;
    }

    handleMessage(msg: IPostMessage) {
        switch (msg.type) {
            case MESSAGE_INIT: {
                this.frameInitialized = true;
                this.sendInitialDatasourceState()
                this.store.dispatch(Datasource.finishedLoading(this.id))
                console.log("Datasource initialized")
                break;
            }
            case MESSAGE_DATA: {
                this.store.dispatch(DatasourceData.fetchedDatasourceData(this.state.id, msg.payload))
                break;
            }
            default:
                break;
        }
    }

    sendMessage(msg: IPostMessage) {
        if (!this.iFrame.contentWindow) {
            // This happens during import. We ignore it silently and rely on later disposal to free memory.
            // TODO: Find a way to dispose this instance before this happens.
            return;
        }
        this.iFrame.contentWindow.postMessage(msg, '*')
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

    private sendDatasourceState() {
        console.log("Send state to datasource")
        const state = this.store.getState()
        const dsState = state.datasources[this.id]
        this.sendMessage({
            type: MESSAGE_STATE,
            payload: dsState
        })
    }

    private sendInitialDatasourceState() {
        const state = this.store.getState()
        const dsState = state.datasources[this.id]
        this.sendMessage({
            type: MESSAGE_INITIAL_STATE,
            payload: dsState
        })
    }
}
