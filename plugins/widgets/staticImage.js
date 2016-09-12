/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {

    const TYPE_INFO = {
        type: "static-image-widgets",
        name: "Image",
        description: "Display a static image",
        settings: [
            {
                id: 'datasource',
                name: 'Datasource',
                type: 'datasource'
            },
            {
                id: 'url',
                name: 'Image Url',
                type: 'string'
            }
        ]
    };

    class Widget extends React.Component {
        render() {
            const props = this.props;
            const settings = props.state.settings;

            return <div style={{width: '100%', height: '100%'}}>
                <img style={{
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto"
                }} width="100%" src={settings.url}/>
            </div>

        }
    }

    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);

})();
