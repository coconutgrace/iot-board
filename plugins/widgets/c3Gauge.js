/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {
    const TYPE_INFO = {
        type: "c3-gauge",
        name: "C3 Gauge",
        version: "0.0.1",
        author: "Lobaro",
        kind: "widget",
        description: "Renders a Gauge using the C3 library. The gauge always shows a property from the last datasource value.",
        dependencies: [
            "https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css"
        ],
        settings: [
            {
                id: 'datasource',
                name: 'Datasource',
                type: 'datasource',
                description: "The data source from which the last value is used as gauge value (you can specify a dataPath below)."
            },
            {
                id: 'dataPath',
                type: "string",
                name: "Data Path",
                description: "The path to get the data from the last data source value, e.g. nested.array[4] - do not use quoted between []",
                defaultValue: ''
            },
            {
                id: 'min',
                type: "number",
                name: "Min value",
                description: "Set min value of the gauge.",
                defaultValue: 0
            },
            {
                id: 'max',
                type: "number",
                name: "Max value",
                description: "Set max value of the gauge.",
                defaultValue: 100
            },
            {
                id: 'units',
                type: "string",
                name: "Units",
                description: "Set units of the gauge.",
                defaultValue: " %"
            },
            {
                id: 'showLabel',
                type: "boolean",
                name: "Show Label",
                description: "Show or hide label on gauge.",
                defaultValue: true
            },
            {
                id: 'colors',
                type: "json",
                name: "Colors (left to right)",
                description: "Array of color values from left to right.",
                defaultValue: '["#FF0000","#F97600","#F6C600","#60B044"]'
            },
            {
                id: 'colorThreshold',
                type: "json",
                name: "Color Threshold (left to right)",
                description: "Thresholds to change colors.",
                defaultValue: "[10, 60, 90, 100]"
            }

        ]
    };

    function safeParseJsonArray(string) {
        try {
            return JSON.parse(string);
        }
        catch (e) {
            console.error("Was not able to parse JSON: " + string);
            return []
        }
    }

    class Widget extends React.Component {

        componentDidMount() {
            this._createChart(this.props);
        }

        componentWillReceiveProps(nextProps) {
            if (nextProps.state.settings !== this.props.state.settings
                || nextProps.state.height !== this.props.state.height) {
                this._createChart(nextProps);
            }
        }

        getData() {
            const props = this.props;
            const settings = props.state.settings;
            let data = props.getData(settings.datasource);
            if (data.length > 0) {
                data = data[data.length - 1]
            }

            return widgetHelper.propertyByString(data, settings['dataPath']) || 0;
        }

        _createChart(props) {
            const config = props.state.settings;

            this.chart = c3.generate({
                bindto: '#chart-' + props.state.id,
                size: {
                    height: props.state.availableHeightPx - 20
                },
                data: {
                    columns: [
                        ['data', this.getData()]
                    ],
                    type: 'gauge'
                },
                gauge: {
                    min: config['min'],
                    max: config['max'],
                    units: config['units'],
                    label: {
                        show: config['showLabel'],
                        format: function (value, ratio) {
                            return value;
                        }
                    },
                    expand: false
                },
                color: {
                    pattern: safeParseJsonArray(config['colors']),
                    threshold: {
                        values: safeParseJsonArray(config['colorThreshold'])
                    }
                },
                transition: {
                    duration: 0
                }
            })

        }

        _renderChart() {
            if (!this.chart) {
                return;
            }

            this.chart.load({
                columns: [
                    ['data', this.getData()]
                ]
            });


        }

        render() {
            this._renderChart();
            return <div id={'chart-' + this.props.state.id}></div>
        }

        componentWillUnmount() {
            console.log("Unmounted Chart Widget");
        }

        dispose() {
            console.log("Disposed Chart Widget");
        }
    }

    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);

})();
