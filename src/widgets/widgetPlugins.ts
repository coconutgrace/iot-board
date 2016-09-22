/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Action from "../actionNames";
import {genCrudReducer} from "../util/reducer.js";
import {PropTypes as Prop} from "react";
import Dashboard from "../dashboard";
import * as AppState from "../appState";
import {ITypeInfo} from "../pluginApi/pluginRegistry";


// TODO: Later load all plugins from external URL's ?
const initialState: IWidgetPluginsState = {
    "chart": {
        id: "chart",
        url: "./plugins/widgets/chartWidget.js",
        typeInfo: {
            type: "will-be-loaded",
            name: "chart (not loaded yet)"
        },
        isLoading: true
    },
    "text": {
        id: "text",
        url: "./plugins/widgets/textWidget.js",
        typeInfo: {
            type: "will-be-loaded",
            name: "text (not loaded yet)"
        },
        isLoading: true
    }

};

// TODO: Remove when not used anymore
export const widgetPluginType = Prop.shape({
    id: Prop.string.isRequired,
    typeInfo: Prop.shape({
        type: Prop.string.isRequired,
        name: Prop.string.isRequired,
        settings: Prop.array
    })
});

export interface IWidgetPluginsState {
    [id: string]: IWidgetPluginState
}

export interface IWidgetPluginState {
    id: string
    url: string
    typeInfo: IWidgetTypeInfo
    isLoading: boolean
}


export interface IWidgetTypeInfo extends ITypeInfo {
    rendering?: "dom" | "react"
}

export interface IWidgetPluginAction extends AppState.Action {
    id?: string
    url?: string
    typeInfo?: ITypeInfo
}


export function unloadPlugin(type: string): AppState.ThunkAction {
    return function (dispatch) {
        const widgetPlugin = Dashboard.getInstance().widgetPluginRegistry.getPlugin(type);
        widgetPlugin.dispose();
        dispatch(deletePlugin(type));
    }
}

function deletePlugin(type: string): IWidgetPluginAction {
    return {
        type: Action.DELETE_WIDGET_PLUGIN,
        id: type
    }
}

const pluginsCrudReducer = genCrudReducer([Action.WIDGET_PLUGIN_FINISHED_LOADING, Action.DELETE_WIDGET_PLUGIN], widgetPlugin);
export function widgetPlugins(state: IWidgetPluginsState = initialState, action: IWidgetPluginAction) {

    state = pluginsCrudReducer(state, action);
    switch (action.type) {
        case Action.STARTED_LOADING_PLUGIN_FROM_URL:
            if (state[action.id]) {
                return _.assign({}, state, {
                    [action.id]: widgetPlugin(state[action.id], action)
                });
            }
            else {
                return state;
            }
        default:
            return state;
    }

}

function widgetPlugin(state: IWidgetPluginState, action: IWidgetPluginAction): IWidgetPluginState {
    switch (action.type) {
        case Action.WIDGET_PLUGIN_FINISHED_LOADING:
            if (!action.typeInfo.type) {
                // TODO: Catch this earlier
                throw new Error("A Plugin needs a type name.");
            }

            return {
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
