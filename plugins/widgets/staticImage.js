/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {

    const TYPE_INFO = {
        type: "static-image",
        name: "Image",
        version: "0.0.2",
        author: "Lobaro",
        kind: "widget",
        description: "Display a static image",
        settings: [
            {
                id: 'url',
                name: 'Image Url',
                type: 'string'
            },
            {
                id: 'sizing',
                name: "Sizing",
                description: "How to size the image",
                type: "option",
                defaultValue: 'custom',
                options: [
                    {name: "Full Width", value: "width"},
                    {name: "Full Height", value: "height"},
                    {name: "Custom", value: "custom"},
                    {name: "Original", value: "original"}
                ]
            },
            {
                id: 'width',
                name: 'Width',
                type: 'string',
                description: 'Width of the image, used in img style attribute',
                defaultValue: ''
            },
            {
                id: 'height',
                name: 'Height',
                type: 'string',
                description: 'Height of the image, used in img style attribute',
                defaultValue: ''
            }
        ]
    };

    class Widget extends React.Component {
        render() {
            const props = this.props;
            const settings = props.state.settings;

            let style = {}
            switch (settings.sizing) {
                case "width": {
                    style.width = '100%';
                    break;
                }
                case "height": {
                    style.height = '100%'
                    break;
                }
                case "custom": {
                    style.width = settings.width;
                    style.height = settings.height;
                    break;
                }
            }

            return                 <img style={_.assign({
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto"
                }, style)} src={settings.url}/>


        }
    }

    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);

})();
