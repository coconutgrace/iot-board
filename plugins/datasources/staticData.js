/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function (window) {
    const TYPE_INFO = {
        type: "static-data",
        name: "Static Data",
        description: "Datasource that provides static data",
        settings: [
            {
                id: "data",
                name: "Data",
                description: "The data that is returned by the datasource, must be an json-array of json-objects",
                type: "json",
                defaultValue: "[]"
            }
        ]
    };

    class Datasource {

        initialize(props) {
            props.setFetchInterval(Infinity);
            props.setFetchReplaceData(true)
        }

        fetchData(resolve, reject) {
            const settings = this.props.state.settings;
            let data;
            try {
                data = JSON.parse(settings.data)

                if (!_.isArray(data)) {
                    data = [{error: "'data' must be an array of objects but is " + typeof(data)}]
                }
                else if (data.length > 0) {
                    const wrongTypeElem = _.find(data, (element) => !_.isPlainObject(data[0]));
                    if (wrongTypeElem !== undefined) {
                        data = [{error: "'data' must be an array of objects but contains " + wrongTypeElem + " JSON: " + JSON.stringify(wrongTypeElem)}]
                    }
                }
            }
            catch (error) {
                data = [{error: "Failed to parse 'data': " + error.message}]
            }


            resolve(data)
        }



    }

    window.iotDashboardApi.registerDatasourcePlugin(TYPE_INFO, Datasource);

})(window);
