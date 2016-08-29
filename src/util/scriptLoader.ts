import loadjs = require('loadjs');
import * as _ from 'lodash'

// This is a class because we can not mock it on module level.
export default class ScriptLoader {
    static loadScript(paths: Array<string>): Promise<void> {
        const jsPaths = _.filter(paths, (p) => _.endsWith(p, ".js"))
        const cssPaths = _.filter(paths, (p) => _.endsWith(p, ".css"))

        _.forEach(cssPaths, (path) => {
            $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', path));
        })

        return new Promise<void>((resolve, reject) => {
            try {
                loadjs(jsPaths, {
                    success: () => {
                        resolve();
                    },
                    error: (error: Error) => {
                        reject(error);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}
