/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from "react";
import {DashboardStore} from "../store";
import {IPluginFactory} from "../pluginApi/pluginTypes";
import {WidgetPluginInstance} from "./widgetPluginInstance";

export default class WidgetPluginFactory implements IPluginFactory<WidgetPluginInstance> {


    // TODO: The WidgetPluginInstance should be a plain class that might have access to the underlying component
    instances: { [id: string]: WidgetPluginInstance} = {};
    disposed = false;


    constructor(private type: string, private store: DashboardStore) {
    }

    getInstance(id: string) {
        if (this.disposed === true) {
            throw new Error("Try to create widget of destroyed type: " + this.type);
        }

        if (this.instances[id]) {
            return this.instances[id];
        }

        this.instances[id] = new WidgetPluginInstance(id, this.store);
        return this.instances[id];
    }


    dispose() {
        this.disposed = true;
        _.valuesIn(this.instances).forEach((widgetPluginInstance) => {
            widgetPluginInstance.dispose();
        })
        this.instances = {};
    }


}
