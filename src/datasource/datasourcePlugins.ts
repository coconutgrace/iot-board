/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Action from "../actionNames";
import {genCrudReducer} from "../util/reducer.js";
import * as AppState from "../appState";
import Dashboard from "../dashboard";

const initialState: IDatasourcePluginsState = {};


export interface IDatasourcePluginsState {
    [key: string]: IDatasourcePluginState
}


export interface IDatasourcePluginState extends AppState.Action {
    id: string
    typeInfo: AppState.ITypeInfo
    url: string
    isDatasource: boolean
    isWidget: boolean
}


export interface IDatasourcePluginAction extends AppState.Action {
    typeInfo: AppState.ITypeInfo
    url: string
    pluginType: string
}





export function unloadPlugin(type: string) {
    return function (dispatch: AppState.Dispatch) {
        const dsFactory = Dashboard.getInstance().datasourcePluginRegistry.getPlugin(type);
        dsFactory.dispose();
        dispatch(deletePlugin(type));
    }
}

function deletePlugin(type: string) {
    return {
        type: Action.DELETE_DATASOURCE_PLUGIN,
        id: type
    }
}

const pluginsCrudReducer: Function = genCrudReducer([Action.ADD_DATASOURCE_PLUGIN, Action.DELETE_DATASOURCE_PLUGIN], datasourcePlugin);
export function datasourcePlugins(state: IDatasourcePluginsState = initialState, action: AppState.Action) {

    state = pluginsCrudReducer(state, action);
    switch (action.type) {
        default:
            return state;
    }

}

function datasourcePlugin(state: IDatasourcePluginState, action: IDatasourcePluginAction): IDatasourcePluginState {
    switch (action.type) {
        case Action.ADD_DATASOURCE_PLUGIN:
            if (!action.typeInfo.type) {
                // TODO: Catch this earlier
                throw new Error("A Plugin needs a type name. Please define TYPE_INFO.type");
            }

            return <IDatasourcePluginState>{
                id: action.typeInfo.type,
                url: action.url,
                typeInfo: action.typeInfo,
                isDatasource: action.pluginType === "datasource",
                isWidget: action.pluginType === "widget"
            };
        default:
            return state;
    }
}