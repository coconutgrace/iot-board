/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as _ from 'lodash'

const configJson = <IConfigState>require('./config.json');
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
    }
};


export interface IConfigState {
    devMode: boolean
    version: string
    revision: string
    revisionShort: string
    branch: string
    persistenceTarget: string | "local-storage" | ""
    auth: IAuthConfig
}

export interface IAuthConfig {
    username: string
    logoutUrl: string
}

export function config(state: IConfigState = configJson, action: any): IConfigState {
    switch (action.type) {
        default:
            // Content of configJson overrides everything else!
            return _.assign<any, IConfigState>({}, defaultConfig, state, configJson);
    }
}

export default config;
