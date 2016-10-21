/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as _ from "lodash";
import {DashboardStore} from "../store";
import * as Datasource from "./datasource";
import {IDatasourcesState} from "./datasource";
import {DatasourcePluginInstance} from "./datasourcePluginInstance";
import {IPluginFactory, IDatasourcePlugin, IDatasourceState, IDatasourceClass} from "../pluginApi/pluginTypes";
import Unsubscribe = Redux.Unsubscribe;


/**
 * Connects a datasource to the application state
 */
export default class DataSourcePluginFactory implements IPluginFactory<DatasourcePluginInstance> {

    private _pluginInstances: {[id: string]: DatasourcePluginInstance} = {};
    private _disposed: boolean = false;
    private oldDatasourcesState: IDatasourcesState;

    constructor(private _type: string, private _datasource: IDatasourcePlugin, private _store: DashboardStore) {
        //this._unsubscribe = _store.subscribe(() => this.handleStateChange());
    }

    get type() {
        return this._type;
    }

    get disposed() {
        return this._disposed;
    }

    getInstance(id: string) {
        if (this._disposed === true) {
            throw new Error("Try to get datasource of destroyed type. " + JSON.stringify({id, type: this.type}));
        }
        if (!this._pluginInstances[id]) {
            return this.createInstance(id)
        }
        return this._pluginInstances[id];
    }

    dispose() {
        this._disposed = true;
        _.valuesIn<IDatasourcePlugin>(this._pluginInstances).forEach((plugin) => {
            if (_.isFunction(plugin.dispose)) {
                try {
                    plugin.dispose();
                }
                catch (e) {
                    console.error("Failed to destroy Datasource instance", plugin);
                }
            }
        });
        this._pluginInstances = {};
    }

    handleStateChange() {
        const state = this._store.getState();

        if (this.oldDatasourcesState === state.datasources) {
            return;
        }
        this.oldDatasourcesState = state.datasources;

        // Create Datasource instances for missing data sources in store
        _.valuesIn<IDatasourceState>(state.datasources)
            .filter((dsState) => dsState.type === this.type)
            .forEach((dsState) => {
                if (this._pluginInstances[dsState.id] === undefined) {
                    this._pluginInstances[dsState.id] = this.createInstance(dsState.id);
                    this._store.dispatch(Datasource.finishedLoading(dsState.id))
                }
            });


    }

    private createInstance(id: string): DatasourcePluginInstance {
        if (this._disposed === true) {
            throw new Error("Try to create datasource of destroyed type: " + JSON.stringify({id, type: this.type}));
        }
        if (this._pluginInstances[id] !== undefined) {
            throw new Error("Can not create datasource instance. It already exists: " + JSON.stringify({
                    id,
                    type: this.type
                }));
        }

        const state = this._store.getState();
        const dsState = state.datasources[id];

        if (!dsState) {
            throw new Error("Can not create instance of non existing datasource with id " + id);
        }

        return new DatasourcePluginInstance(id, this._store);
    }
}
