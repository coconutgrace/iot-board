/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import {IDatasourcePlugin, IDatasourceConstructor, IDatasourceProps} from "./datasourcePluginFactory";
import {DashboardStore} from "../store";
import {DatasourceScheduler} from "./datasourceScheduler";
import * as Datasource from "./datasource";

/**
 * Represents a plugin instance, state should be saved in store!
 */
export class DatasourcePluginInstance {
    private scheduler: DatasourceScheduler;
    private dsInstance: IDatasourcePlugin;


    constructor(public id: string, private dsConstructor: IDatasourceConstructor, private store: DashboardStore) {
        this.scheduler = new DatasourceScheduler(this, this.store);
        this.initializePluginInstance()
    }

    initializePluginInstance() {
        const dsState = this.state;
        const props = {
            state: dsState,
            setFetchInterval: (ms: number) => this.setFetchInterval(ms),
            setFetchReplaceData: (replace: boolean) => this.setFetchReplaceData(replace)
        };

        console.log("dsConstructor", this.dsConstructor);
        const pluginInstance = new this.dsConstructor();
        this.dsInstance = pluginInstance;

        pluginInstance.props = props;

        // Bind API functions to instance
        if (_.isFunction(pluginInstance.datasourceWillReceiveProps)) {
            pluginInstance.datasourceWillReceiveProps = pluginInstance.datasourceWillReceiveProps.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.datasourceWillReceiveSettings)) {
            pluginInstance.datasourceWillReceiveSettings = pluginInstance.datasourceWillReceiveSettings.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.dispose)) {
            pluginInstance.dispose = pluginInstance.dispose.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.fetchData)) {
            pluginInstance.fetchData = pluginInstance.fetchData.bind(pluginInstance);
        }
        if (_.isFunction(pluginInstance.initialize)) {
            pluginInstance.initialize = pluginInstance.initialize.bind(pluginInstance);
        }
    }

    get props() {
        return this.dsInstance.props;
    }

    setFetchInterval(intervalMs: number) {
        this.scheduler.fetchInterval = intervalMs;
    }

    setFetchReplaceData(replace: boolean) {
        this.store.dispatch(Datasource.updatedFetchReplaceData(this.id, replace));
    }

    /**
     * The the number of values stored in the datasource
     * @param maxValues
     */
    setMaxValues(maxValues: number) {
        this.store.dispatch(Datasource.updatedMaxValues(this.id, maxValues));
    }

    set props(newProps: any) {
        const oldProps = this.dsInstance.props;
        if (oldProps !== newProps) {
            this.datasourceWillReceiveProps(newProps);
            this.dsInstance.props = newProps;
            if (newProps.state.settings !== oldProps.state.settings) {
                this.scheduler.forceUpdate();
            }
        }
    }

    get state() {
        const state = this.store.getState();
        const dsState = state.datasources[this.id];

        if (!dsState) {
            throw new Error("Can not get state of non existing datasource with id " + this.id);
        }

        return dsState;
    }

    get pluginState() {
        return this.store.getState().datasourcePlugins[this.state.type];
    }

    initialize() {
        if (_.isFunction(this.dsInstance.initialize)) {
            this.dsInstance.initialize(this.props);
        }
        this.scheduler.start();
    }

    datasourceWillReceiveProps(newProps: IDatasourceProps) {
        if (newProps.state.settings !== this.props.state.settings) {
            if (_.isFunction(this.dsInstance.datasourceWillReceiveSettings)) {
                this.dsInstance.datasourceWillReceiveSettings(this.props.state.settings);
            }
        }

        if (_.isFunction(this.dsInstance.datasourceWillReceiveProps)) {
            this.dsInstance.datasourceWillReceiveProps(newProps);
        }
    }

    fetchData(resolve: (value?: any | PromiseLike<any>) => void, reject: (reason?: any) => void) {
        if (!this.dsInstance.fetchData) {
            console.warn("fetchData(resolve, reject) is not implemented in Datasource ", this.dsInstance);
            reject(new Error("fetchData(resolve, reject) is not implemented in Datasource " + this.pluginState.id))
        }
        this.dsInstance.fetchData(resolve, reject);

    }

    dispose() {
        this.scheduler.dispose();
    }
}
