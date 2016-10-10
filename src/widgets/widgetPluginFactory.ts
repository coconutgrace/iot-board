/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {connect} from "react-redux";
import * as React from "react";
import {DashboardStore} from "../store";
import {ITypeInfo, IPlugin, IPluginFactory, IWidgetState} from "../pluginApi/pluginTypes";
import {GetState, State} from "../appState";
import {DomWidgetContainer} from "./domWidgetContainer";
import * as Widgets from "./widgets";
import {IDatasourcesState} from "../datasource/datasource";
import ComponentSpec = __React.ComponentSpec;
import ReactInstance = __React.ReactInstance;
import ReactElement = __React.ReactElement;


export interface IWidgetPluginClass {
    new(props: any): IWidgetPlugin
}

// ComponentSpec<any, any>
export interface IWidgetPlugin extends IPlugin, ComponentSpec<IWidgetProps, any> {
    element: ReactInstance
}

export interface IWidgetPluginModule {
    TYPE_INFO: ITypeInfo
    Widget: IWidgetPlugin
}

export interface GetDataFunction {
    (getState: GetState, dsId: string): any[]
}

export interface IWidgetProps {
    state?: IWidgetState
    getData?: GetDataFunction
    updateSetting?: (settingId: string, value: any) => void
    _datasources?: IDatasourcesState
    _widgetClass?: IWidgetPluginClass // TODO: type the widget class
}

export default class WidgetPluginFactory implements IPluginFactory<ReactElement<IWidgetProps>> {


    instances: { [id: string]: ReactElement<IWidgetProps>} = {};
    disposed = false;

    /**
     * The getState function for widgets, the "getState" is bound to the store
     */
    getData: GetDataFunction

    constructor(private type: string, private widget: IWidgetPluginClass, private store: DashboardStore) {
        // only bind the getData function once, so it can be safely used in the connect function
        this.getData = function (getState: GetState, dsId: string) {
            const ds = getState().datasources[dsId];
            if (!ds) {
                return [];
            }
            return ds.data || [];
        }.bind(this, this.store.getState);
    }

    updateSetting(widgetId: string, settingId: string, value: any) {
        console.log("update", settingId, "to", value, 'of', widgetId)
        this.store.dispatch(Widgets.updatedSingleSetting(widgetId, settingId, value));
    }

    getInstance(id: string) {
        if (this.disposed === true) {
            throw new Error("Try to create widget of destroyed type: " + this.type);
        }

        if (this.instances[id]) {
            return this.instances[id];
        }

        // TODO: check if module.Widget is a react component
        const widgetPlugin = this.store.getState().widgetPlugins[this.type];
        const rendering = widgetPlugin.typeInfo.rendering || "react";

        let widgetComponent = this.widget;
        if (rendering.toLowerCase() === "dom") {
            // TODO: any batter way to avoid the any cast?
            widgetComponent = <any>DomWidgetContainer;
        }


        const widget = connect(() => {
                // This method will be used as mapStateToProps, leading to a constant "getData()" function per instance
                // Therefor the update is only called when actual state changes
                return (state: State): any => {
                    const widgetState = state.widgets[id];
                    return {
                        state: widgetState,
                        // This is used to trigger re-rendering on Datasource change
                        // TODO: in future only the datasources the Widget is interested in should trigger re-rendering
                        _datasources: state.datasources,
                        getData: this.getData,
                        updateSetting: this.updateSetting.bind(this, id)
                    }
                };
            }
        )(<any>widgetComponent); // TODO: get rid of the any?

        this.instances[id] = React.createElement(widget, <any>{_widgetClass: this.widget});
        // Should we create here or always outside?
        return this.instances[id];
    }


    dispose() {
        this.disposed = true;
        this.instances = {};
    }


}
