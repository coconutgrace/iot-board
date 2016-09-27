/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Action from "../actionNames";
import * as AppState from "../appState";
import * as ModalDialog from "../modal/modalDialog.js"
import * as DatasourcePlugins from "../datasource/datasourcePlugins"
import * as WidgetPlugins from "../widgets/widgetPlugins"
import {IPluginModule} from "./pluginRegistry";
import {IDatasourcePluginModule} from "../datasource/datasourcePluginRegistry";
import {Dispatch} from "../appState";

const initialState: IPluginLoaderState = {
    loadingUrls: []
};

export interface IPluginLoaderState {
    loadingUrls: string[]
}
export interface IPluginLoaderAction extends AppState.Action {
    id: string
    url: string
}


export function startLoadingPluginFromUrl(url: string, id?: string): IPluginLoaderAction {
    return {
        type: Action.STARTED_LOADING_PLUGIN_FROM_URL,
        id,
        url
    }
}

export function pluginFailedLoading(url: string) {
    return (dispatch: Dispatch) => {
        dispatch(ModalDialog.addError("Failed to load plugin from " + url))

        dispatch({
            type: Action.PLUGIN_FAILED_LOADING,
            url
        })
    }
}

export function widgetPluginFinishedLoading(plugin: IPluginModule, url: string = null) {
    return {
        type: Action.WIDGET_PLUGIN_FINISHED_LOADING,
        id: plugin.TYPE_INFO.type, // needed for crud reducer
        typeInfo: plugin.TYPE_INFO,
        isLoading: false,
        url
    };

}

export function datasourcePluginFinishedLoading(plugin: IDatasourcePluginModule, url: string = null) {
    return {
        type: Action.DATASOURCE_PLUGIN_FINISHED_LOADING,
        id: plugin.TYPE_INFO.type, // needed for crud reducer
        typeInfo: plugin.TYPE_INFO,
        isLoading: false,
        url
    };

}

export function pluginLoaderReducer(state: IPluginLoaderState = initialState, action: IPluginLoaderAction) {
    const newState = _.assign({}, state);
    newState.loadingUrls = urlsReducer(state.loadingUrls, action);
    return newState;
}

export function publishPlugin(id: string) {
    return function (dispatch: AppState.Dispatch, getState: AppState.GetState) {
        const state = getState()
        const dsPlugin = state.datasourcePlugins[id];
        const widgetPlugin = state.widgetPlugins[id];

        const isDatasource = !!dsPlugin;

        const plugin = isDatasource ? dsPlugin : widgetPlugin


        const registryBaseUrl = "http://localhost:8081" // TODO: Configure in UI
        const apiKey = 'f1566816767de275ff898dd36a0ee608'  // TODO: Configure in UI

        fetch(plugin.url, {
            method: 'get'
        }).then((response) => {
            return response.text();
        }).then((scriptContent) => {
            const data = {
                "MetaInfo": plugin.typeInfo,
                "Code": scriptContent
            }

            return fetch(registryBaseUrl + '/api/plugins/' + id, {
                method: 'post',
                body: JSON.stringify(data),
                headers: {
                    Authorization: apiKey
                }
            })
        }).then(function (response) {
            if (response.status >= 400) {
                return response.json().then((json) => {
                    if (json.error) {
                        throw new Error("Failed to publish Plugin: " + json.error);
                    }
                    throw new Error("Failed to publish Plugin");
                })
            }
            return response.json();
        }).then(function (json: any) {
            if (isDatasource) {
                dispatch(DatasourcePlugins.publishedDatasourcePlugin(id, registryBaseUrl + json.url, json.typeInfo))
            }
            else {
                dispatch(WidgetPlugins.publishedWidgetPlugin(id, registryBaseUrl + json.url, json.typeInfo))
            }
        }).catch(function (err) {
            dispatch(ModalDialog.addError(err.message))
        });
    }
}

function urlsReducer(state: string[], action: IPluginLoaderAction): string[] {
    switch (action.type) {
        case Action.STARTED_LOADING_PLUGIN_FROM_URL:
            console.log("add url to pluginLoader: ", action.url)
            if (!action.url) {
                throw new Error("Can not load plugin from empty URL");
            }
            return [...state].concat([action.url]);
        case Action.PLUGIN_FAILED_LOADING:
        case Action.WIDGET_PLUGIN_FINISHED_LOADING:
        case Action.DATASOURCE_PLUGIN_FINISHED_LOADING:
            console.log("remove url from pluginLoader: ", action.url)
            return [...state].filter((url) => url !== action.url);
        default:
            return state;
    }
}
