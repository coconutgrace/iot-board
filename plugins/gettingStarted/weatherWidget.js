// The structure of a Widget plugin is very similar to a DataSource
// Please see the comments at the weather datasource if you miss something here.
(function (window) {

    const TYPE_INFO = {
        type: 'simpleweatherjs-widget',
        name: 'Weather',
        kind: 'widget',
        author: 'Lobaro',
        version: '1.0.0',
        description: 'Visualize Weather data',
        settings: [
            {
                id: 'datasource-setting',
                name: 'Datasource',
                // datasource is a special type that let the user select a datasource
                // The widget will only have access to data from assigned datasources
                // If you need more than one datasource, you can specify multiple settings
                type: 'datasource',
                description: "Datasource to get the weather data"
            }
        ]
    };

    // A Widget is based on a ReactJS Component
    // React is available to all plugins and must not be declared as dependency
    class Plugin extends React.Component {
        // Beside all optional lifecycle methods of React you must specify a render method
        // Render is called when ever settings change or a
        render() {
            // Like in the datasource we can access props via 'this.props'
            const props = this.props;
            // And the settings are saved in the same location as for datasources
            const settingValues = props.state.settings;

            // The getData() function returns data from the datasource, just hand over the selected datasource from the settings
            // The dashboard will always return an array of object
            const allData = props.getData(settingValues['datasource-setting']);

            // When there is no data, we let the user know by rendering a static text
            if (allData.length === 0) {
                // We can use 'jsx' syntax here. Babel will compile the <div> to:
                // return React.createElement('div', null, 'No Data');
                return <div>No Data</div>
            }

            // Since we just want to show the last fetched value from the datasource we take the last element
            const data = allData[allData.length - 1];
            const units = data.units || {};

            return (
                <div style={{padding: 5}}>
                    <h1 style={{marginTop: 0}}>{data.city}, {data.country}</h1>
                    <p>{data.updated}</p>
                    <p><img className="" style={{float: 'left'}} src={data.image}/>
                        <span>
                        Temp: {data.temp} {units.temp}<br />
                        Humidity: {data.humidity} %<br />
                        Pressure: {data.pressure} {units.pressure}
                    </span>
                    </p>
                </div>
            )
        }
    }

    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Plugin)
})(window);
