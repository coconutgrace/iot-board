/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as _ from 'lodash'
import * as Action from './actionNames'

const buildInfo = <IConfigState>require('./buildInfo.json');

/**
 * Override config values at runtime in dashboard.json, see: https://gitlab.com/lobaro/iot-dashboard/wikis/home#configuration
 */
const defaultConfig: IConfigState = {
    version: "",
    revision: "",
    revisionShort: "",
    branch: "",
    persistenceTarget: "local-storage",
    devMode: true,
    auth: {
        username: null,
        logoutUrl: null
    },
    title: {
        text: "IoT-Dashboard",
        url: "http://iot-dashboard.org"
    },
    pluginRegistryApiKey: "",
    pluginRegistryUrl: "https://dashboard.lobaro.com"
};


export interface IConfigState {
    devMode: boolean
    version: string
    revision: string
    revisionShort: string
    branch: string
    persistenceTarget: string | "local-storage" | ""
    auth: IAuthConfig
    pluginRegistryApiKey: string
    pluginRegistryUrl: string
    title: ITitleConfig
}

export interface IAuthConfig {
    username: string
    logoutUrl: string
}

export interface ITitleConfig {
    text: string
    url: string
}

export function setConfigValue(key: string, value: any) {
    return {
        type: Action.SET_CONFIG_VALUE,
        key,
        value
    }
}

export function config(state: IConfigState = buildInfo, action: any): IConfigState {
    switch (action.type) {
        case Action.SET_CONFIG_VALUE: {
            let value = action.value;
            if (action.key === 'pluginRegistryUrl' && _.endsWith(value, '/')) {
                value = value.replace(/\/+$/, "");
            }
            return _.assign({}, defaultConfig, state, {[action.key]: value}, buildInfo)
        }
        default:
            // Content of configJson overrides everything else!
            return _.assign({}, defaultConfig, state, buildInfo);
    }
}

export default config;
