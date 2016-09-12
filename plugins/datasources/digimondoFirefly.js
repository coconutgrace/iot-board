(function () {

    // Digimondo Frontend: https://frontend.digimondo.io/login

    // https://api.digimondo.io/v1/aaaaaaaabbccddff?auth=3a9fce0d7fd743e56010d770d7432f6f&limitToLast=10
    // &offset=10
    // &payloadonly
    // TODO: Make a boolean flag to only receive new values based on "receivedAfter" set to last received value

    const TYPE_INFO = {
        type: "digimondo-firefly-datasource",
        name: "Digimondo Firefly",
        description: "Fetch parsed data from the Digimondo API",
        dependencies: [
            "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment-with-locales.min.js"
        ],
        settings: [
            {
                id: "auth",
                name: "Auth Token",
                description: "Digimondo Authentication Token (Secret API Key)",
                defaultValue: "",
                required: true,
                type: "string"
            },
            {
                id: "deviceEui",
                name: "Filter Device EUI",
                description: "Only parse data from given Device EUI",
                defaultValue: "",
                type: "string"
            },
            {
                id: "limitToLast",
                name: "Limit",
                description: "The amount Packets to be returned. Ordered by creation date, descending (unless otherwise specified through the direction parameter). Default value is 1 Maximum value is 100.",
                defaultValue: 0,
                type: "number"
            },
            {
                id: "offset",
                name: "Offset",
                description: "The amount of most recent Packets to skip before returning Packets. Default value is 0.",
                defaultValue: 0,
                type: "number"
            },
            {
                id: "direction",
                name: "Direction",
                description: "When set to asc, it will return the oldest Packets first. When set to desc, it will return the most recent packets. Default is desc.",
                defaultValue: "",
                type: "string"
            },
            {
                id: "fetchInterval",
                name: "Fetch Interval",
                description: "How ofter should data be fetched in ms",
                defaultValue: "1000",
                type: "number"
            }
        ]
    };

    class Datasource {

        initialize(props) {
            if (props.state.settings.fetchInterval) {
                props.setFetchInterval(props.state.settings.fetchInterval);
            }
        }

        datasourceWillReceiveSettings(nextSettings) {
            if (nextSettings.fetchInterval) {
                this.props.setFetchInterval(nextSettings.fetchInterval);
            }
        }

        getLatestRecivedAt() {

        }

        fetchData(resolve, reject) {

            const settings = this.props.state.settings;
            let oldData = this.props.state.data;
            let receivedAfter = null;

            if (oldData.length > 0) {
                let latestPacket = _.reduce(oldData, (result, value) => {
                    if (moment(value.received_at).isAfter(moment(result.received_at))) {
                        return value
                    }
                    return result
                })

                if (latestPacket) {
                    receivedAfter = latestPacket.received_at;
                }
            }

            const request = new Request("http://firefly.lobaro.com/api/v1/devices/eui/" +
                settings.deviceEui + "/packets" +
                "?auth=" + settings.auth +
                (settings.limitToLast ? "&limit_to_last=" + settings.limitToLast : "" ) +
                (settings.offset ? "&offset=" + settings.offset : "" ) +
                (settings.direction ? "&direction=" + settings.direction : "" ) +
                (receivedAfter ? "&received_after=" + receivedAfter : "" ) +
                "&payloadonly=true", {
                //mode: "no-cors"
            })
            fetch(request)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    let parsedData = _.map(data.packets, (d) => _.assign({}, d.parsed, {received_at: d.received_at}))
                    parsedData = _.sortBy(parsedData, (d) => {
                        return d.received_at;
                    });
                    resolve(parsedData)
                })
        }
    }

    window.iotDashboardApi.registerDatasourcePlugin(TYPE_INFO, Datasource);

})();
