/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FrameDatasourceInstance} from "./frameDatasourceInstance";

export class DatasourceScheduler {

    private _fetchInterval: number = 1000;
    private fetchPromise: Promise<any>;
    private fetchTimeoutRef: number;
    private disposed = false;
    private running = false;


    constructor(private dsInstance: FrameDatasourceInstance) {
    }

    set fetchInterval(ms: number) {
        this._fetchInterval = ms;
        if (this._fetchInterval < 1000) {
            this.fetchInterval = 1000;
            console.warn("Datasource has fetch interval below 1000ms, it was forced to 1000ms\n" +
                "Please do not set intervals shorter than 1000ms. If you really need this, file a ticket with explanation!")
        }

        this.scheduleFetch(this._fetchInterval);
    }


    start() {
        this.running = true;
        // Fetch once as soon as possible
        this.scheduleFetch(0);
    }

    forceUpdate() {
        console.log("Force Update!");
        this.scheduleFetch(0);
    }

    dispose() {
        this.clearFetchTimeout();
        this.disposed = true;
        this.running = false;
    }

    private scheduleFetch(ms: number) {
        this.clearFetchTimeout()
        if (ms === Infinity) {
            return;
        }

        if (!this.running) {
            return;
        }

        this.fetchTimeoutRef = setTimeout(() => {
            this.doFetchData();
        }, ms)
    }

    private clearFetchTimeout() {
        if (this.fetchTimeoutRef) {
            clearTimeout(this.fetchTimeoutRef);
            this.fetchTimeoutRef = null;
        }
    }

    private doFetchData() {
        if (this.fetchPromise) {
            console.warn("Do not fetch data because a fetch is currently running on Datasource", this.dsInstance.id);
            return;
        }

        const fetchPromise = new Promise<any[]>((resolve, reject) => {
            this.dsInstance.fetchData(resolve, reject);

            setTimeout(() => {
                if (this.fetchPromise === fetchPromise) {
                    reject(new Error("Timeout! Datasource fetchData() took longer than 5 seconds."));
                }
            }, 5000);
        });

        this.fetchPromise = fetchPromise;

        fetchPromise.then((result) => {
            this.fetchPromise = null;
            if (!this.disposed) {
                if (result !== undefined) {
                    this.dsInstance.fetchedDatasourceData(result)
                }

                this.scheduleFetch(this._fetchInterval);
            } else {
                console.error("fetchData of disposed plugin finished - result discarded", this.dsInstance.id, result);
            }
        }).catch((error) => {
            console.warn("Failed to fetch data for Datasource of type " + this.dsInstance.type + " with id " + this.dsInstance.id);
            console.error(error);
            this.fetchPromise = null;
            this.scheduleFetch(this._fetchInterval);
        })
    }
}
