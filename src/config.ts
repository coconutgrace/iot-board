/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as _ from 'lodash'

const configJson = <IConfigState>require('./config.json');


export interface IConfigState {
    devMode: boolean
    version: string
    revision: string
    revisionShort: string
    branch: string
}

export function config(state: IConfigState = configJson, action: any): IConfigState {
    switch (action.type) {
        default:
            return _.assign<any, IConfigState>({}, state, configJson);
    }
}

export default config;
