/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import PluginRegistry from "../pluginApi/pluginRegistry";
import {IPluginModule} from "../pluginApi/pluginTypes";
import {DashboardStore} from "../store";
import WidgetPluginFactory from "./widgetPluginFactory";

/**
 * Describes how we expect the plugin module to be
 */
export default class WidgetPluginRegistry extends PluginRegistry<any, any> {

    constructor(store: DashboardStore) {
        super(store);
    }

    createPluginFromModule(module: IPluginModule) {
        console.assert(_.isObject(module.TYPE_INFO), "Missing TYPE_INFO on datasource module. Every module must export TYPE_INFO");
        return new WidgetPluginFactory(module.TYPE_INFO.type, this.store);
    }
}
