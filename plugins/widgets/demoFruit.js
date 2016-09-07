/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function () {

    const TYPE_INFO = {
        type: "demo-fruit",
        name: "Fruit",
        description: "Display fruits based on color values",
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

            let value = data[data.length - 1]

            if (!value) {
                return <p>Invalid Value {JSON.stringify(value)}</p>
            }

            let fruits = [
                {
                    name: "Kokus",
                    color: {"col_R": 174, "col_G": 155, "col_B": 108},
                    img: "fruits/kokus.jpg"
                    // {"col_R":91,"col_G":67,"col_C":217,"col_B":41,"
                },
                {
                    name: "Apfel",
                    color: {"col_R": 192, "col_G": 188, "col_B": 118},
                    img: "/fruits/apfel.png"
                    //"col_R":125,"col_G":131,"col_C":255,"col_B":60,"
                },
                {
                    name: "Orange",
                    color: {"col_R": 255, "col_G": 187, "col_B": 120},
                    img: "/fruits/orange.jpg"
                    // "col_R":255,"col_G":130,"col_C":255,"col_B":61,"
                    //{"col_R":221,"col_G":111,"col_C":255,"col_B":52,"
                },
                {
                    name: "Tomate",
                    color: {"col_R": 167, "col_G": 150, "col_B": 106},
                    img: "/fruits/tomate.jpg"
                    // "col_R":87,"col_G":58,"col_C":197,"col_B":37,"
                },
                {
                    name: "Zitrone",
                    color: {"col_R": 255, "col_G": 224, "col_B": 137},
                    img: "/fruits/zitrone.jpg"
                    // "col_R":239,"col_G":202,"col_B":125,"
                    // "col_R":255,"col_G":236,"col_B":147,"
                }
            ];

            try {
                let results = _.filter(fruits, (f) => {
                    return (_.inRange(f.color.col_R, value.col_R - 10, value.col_R + 10)
                        && _.inRange(f.color.col_G, value.col_G - 10, value.col_G + 10)
                        && _.inRange(f.color.col_B, value.col_B - 10, value.col_B + 10)
                    )
                })


                return <div style={{
                    width: '100%',
                    height: '100%'
                }}>
                    <p>{_.map(results, (r) => r.name).join()}</p>
                    {results.length ? <img
                        style={{
                            display: "block",
                            marginLeft: "auto",
                            marginRight: "auto"
                        }}

                        height="100%" src={results[0].img}/> : null
                    }

                </div>
            } catch (error) {
                console.error(error)
                return <div>{error.message}</div>
            }
        }
    }


    window.iotDashboardApi.registerWidgetPlugin(TYPE_INFO, Widget);


    function rgb2hsv() {
        let rr;
        let gg;
        let bb;
        let r = arguments[0] / 255;
        let g = arguments[1] / 255;
        let b = arguments[2] / 255;
        let h;
        let s;
        let v = Math.max(r, g, b);
        let diff = v - Math.min(r, g, b);
        let diffc = function (c) {
            return (v - c) / 6 / diff + 1 / 2;
        };

        if (diff == 0) {
            h = s = 0;
        } else {
            s = diff / v;
            rr = diffc(r);
            gg = diffc(g);
            bb = diffc(b);

            if (r === v) {
                h = bb - gg;
            } else if (g === v) {
                h = (1 / 3) + rr - bb;
            } else if (b === v) {
                h = (2 / 3) + gg - rr;
            }
            if (h < 0) {
                h += 1;
            } else if (h > 1) {
                h -= 1;
            }
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100)
        };
    }

})();
