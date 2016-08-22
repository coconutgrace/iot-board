/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {

    const TYPE_INFO = {
        type: "counter-widget",
        name: "Counter",
        description: "Displays a button to increase a simple int value",
        settings: [
            {
                id: 'counter',
                name: 'Counter',
                type: 'number',
                description: "The counter value",
                defaultValue: "10"
            }
        ]
    };

    class Widget extends React.Component {

        get counterValue() {
            return parseInt(this.props.state.settings.counter);
        }

        render() {
            const value = this.counterValue;
            return <div style={{width: '100%', height: '100%'}}>
                <p>Value: {value}</p>
                <button onClick={() => {
                    this.props.updateSetting("counter", value + 1)
                }}>+1
                </button>
            </div>
        }
    }

// TODO: Move to core, for simple reuse

    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);

})();
