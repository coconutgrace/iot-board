/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Action, State} from "./appState";
import * as _ from 'lodash'
import * as $ from 'jquery'
import Store = Redux.Store;

let lastAction: IPersistenceAction = {type: "NONE"};
let allowSave = true;
let saveTimeout: number;

export interface IPersistenceAction extends Action {
    doNotPersist?: boolean
}

export function clearData() {
    if (window.confirm("Wipe app data and reload page?")) {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        window.localStorage.setItem("appState", undefined);
        location.reload();
    }
}

// TODO: type middleware
export function persistenceMiddleware({getState}: Store<State>): any {
    return (next: any) => (action: IPersistenceAction) => {

        const nextState = next(action);

        if (!allowSave) {
            lastAction = action;
            return nextState;
        }


        if (!action.doNotPersist) {
            // we wait some before we save
            // this leads to less saving (max every 100ms) without loosing actions
            // if we would just block saving for some time after saving an action we would loose the last actions
            allowSave = false;
            saveTimeout = setTimeout(() => {
                save(getState());
                console.log('Saved state @' + lastAction.type);

                allowSave = true;
            }, 100)


        }
        lastAction = action;
        return nextState;
    }
}

function save(state: State) {
    const target = state.config.persistenceTarget;

    const savableState: State = _.assign({}, state);

    delete savableState.form;
    delete savableState.modalDialog;

    if (target === "local-storage") {
        saveToLocalStorage(savableState);
    }
    else if (target) {
        saveToServer(target, savableState);
    }
}

function saveToServer(target: string, state: State) {
    $.post({
        url: target,
        data: JSON.stringify(state),
        dataType: 'json',
        contentType: "application/json; charset=utf-8"
    });
}

function saveToLocalStorage(state: State) {
    if (typeof window === 'undefined') {
        console.warn("Can not save to local storage in current environment.");
        return;
    }
    window.localStorage.setItem("appState", JSON.stringify(state));
}


export function loadFromLocalStorage() {
    if (typeof window === 'undefined') {
        console.warn("Can not load from local storage in current environment.");
        return undefined;
    }

    const stateString = window.localStorage.getItem("appState");
    let state: State = undefined;
    try {
        if (stateString !== undefined && stateString !== "undefined") {
            state = JSON.parse(stateString);
        }
    }
    catch (e) {
        console.error("Failed to load state from local storage. Data:", stateString, e.message);
    }
    console.log("Loaded state:", state);
    return state !== null ? state : undefined;
}
