/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Action from "../actionNames";
import {genCrudReducer} from "../util/reducer.js";
import * as AppState from "../appState";
import Dashboard from "../dashboard";
import {ITypeInfo} from "../pluginApi/pluginRegistry";


// TODO: does it work to have the URL as ID?
const initialState: IDatasourcePluginsState = {
    "random": { // TODO: can we have another id (id != plugin type) without breaking stuff?
        id: "random",
        url: "./plugins/datasources/randomDatasource.js",
        typeInfo: {
            type: "will-be-loaded"
        },
        isLoading: true
    },
    "time": {
        id: "time",
        url: "./plugins/datasources/timeDatasource.js",
        typeInfo: {
            type: "will-be-loaded"
        },
        isLoading: true
    },
    "static-data": {
        id: "static-data",
        url: "./plugins/datasources/staticData.js",
        typeInfo: {
            type: "will-be-loaded"
        },
        isLoading: true
    },
    "digimondo-firefly-datasource": {
        id: "digimondo-firefly-datasource",
        url: "./plugins/datasources/digimondoFirefly.js",
        typeInfo: {
            type: "will-be-loaded"
        },
        isLoading: true
    }
};


export interface IDatasourcePluginsState {
    [key: string]: IDatasourcePluginState
}


export interface IDatasourcePluginState {
    id: string
    typeInfo: ITypeInfo
    url: string
    isLoading: boolean
}


export interface IDatasourcePluginAction extends AppState.Action {
    typeInfo: ITypeInfo
    url: string
    pluginType: string
    isLoading: boolean
}


export function unloadPlugin(type: string) {
    return function (dispatch: AppState.Dispatch) {
        const dsFactory = Dashboard.getInstance().datasourcePluginRegistry.getPlugin(type);
        dsFactory.dispose();
        dispatch(deletePlugin(type));
    }
}

export function publishedDatasourcePlugin(type: string, url: string, typeInfo: ITypeInfo) {
    return {
        type: Action.PUBLISHED_DATASOURCE_PLUGIN,
        id: type,
        url: url,
        typeInfo: typeInfo
    }
}

function deletePlugin(type: string) {
    return {
        type: Action.DELETE_DATASOURCE_PLUGIN,
        id: type
    }
}

const pluginsCrudReducer: Function = genCrudReducer([Action.DATASOURCE_PLUGIN_FINISHED_LOADING, Action.DELETE_DATASOURCE_PLUGIN], datasourcePlugin);
export function datasourcePlugins(state: IDatasourcePluginsState = initialState, action: any) {

    state = pluginsCrudReducer(state, action);
    switch (action.type) {
        case Action.PUBLISHED_DATASOURCE_PLUGIN: {
            if (state[action.id]) {
                return _.assign({}, state, {
                    [action.id]: datasourcePlugin(state[action.id], action)
                });
            }
            return state;
        }
        case Action.STARTED_LOADING_PLUGIN_FROM_URL: {
            if (state[action.id]) {
                return _.assign({}, state, {
                    [action.id]: datasourcePlugin(state[action.id], action)
                });
            }
            return state;
        }
        default:
            return state;
    }

}

function datasourcePlugin(state: IDatasourcePluginState, action: IDatasourcePluginAction): IDatasourcePluginState {
    switch (action.type) {
        case Action.PUBLISHED_DATASOURCE_PLUGIN: {
            return _.assign({}, state, {
                url: action.url,
                typeInfo: action.typeInfo
            });
        }
        case Action.DATASOURCE_PLUGIN_FINISHED_LOADING:
            if (!action.typeInfo.type) {
                // TODO: Catch this earlier
                throw new Error("A Plugin needs a type name. Please define TYPE_INFO.type");
            }

            return <IDatasourcePluginState>{
                id: action.typeInfo.type,
                url: action.url,
                typeInfo: action.typeInfo,
                isLoading: false
            };
        case Action.STARTED_LOADING_PLUGIN_FROM_URL:
            return _.assign({}, state, {
                isLoading: true
            });
        default:
            return state;
    }
}
