/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import PluginRegistry, {IPluginModule} from "../pluginApi/pluginRegistry";
import {DashboardStore} from "../store";
import {IWidgetPluginClass, default as WidgetPluginFactory} from "./widgetPluginFactory";
/**
 * Describes how we expect the plugin module to be
 */
export interface IWidgetPluginModule extends IPluginModule {
    Widget: IWidgetPluginClass
}

export default class WidgetPluginRegistry extends PluginRegistry<any, any> {

    constructor(store: DashboardStore) {
        super(store);
    }

    createPluginFromModule(module: IWidgetPluginModule) {
        console.assert(_.isObject(module.TYPE_INFO), "Missing TYPE_INFO on datasource module. Every module must export TYPE_INFO");
        return new WidgetPluginFactory(module.TYPE_INFO.type, module.Widget, this.store);
    }
}
