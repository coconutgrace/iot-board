/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {

    const TYPE_INFO = {
        type: "demo-color",
        name: "Color",
        description: "Display color values",
        dependencies: [
            "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment-with-locales.min.js"
        ],
        settings: [
            {
                id: 'datasource',
                name: 'Datasource',
                type: 'datasource'
            }
        ]
    };

    class Widget extends React.Component {

        render() {
            const props = this.props;
            const data = props.getData(props.state.settings.datasource);


            if (!data || data.length == 0) {
                return <p>No data</p>
            }

            let value = data[data.length -1]

            if (!value) {
                return <p>Invalid Value {JSON.stringify(value)}</p>
            }

            return <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgb(' + value.col_R + ',' + value.col_G + ',' + value.col_B + ')'
            }}><p>{moment(value.received_at).format("DD.MM.YYYY HH:mm:ss")}</p>

            </div>
        }
    }


    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);

})();
