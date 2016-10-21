import * as React from "react";
import {connect} from "react-redux";
import {State} from "../appState";
import {IDatasourcesState, datasources} from "./datasource";
import * as _ from "lodash"
import {IDatasourceState} from "../pluginApi/pluginTypes";
import {IDatasourcePluginState, IDatasourcePluginsState} from "./datasourcePlugins";
import Dashboard from "../dashboard";


interface IDatasourceFramesProps {
    datasources: IDatasourcesState
    datasourcePlugins: IDatasourcePluginsState
}

class DatasourceFrames extends React.Component<IDatasourceFramesProps, any> {

    render() {
        return <div style={{width:1, height: 1, position: "fixed", left: 0, top: 0}}>
            {
                _.valuesIn(this.props.datasources).map((dsState: IDatasourceState) => {
                    const pluginLoaded = Dashboard.getInstance().datasourcePluginRegistry.hasPlugin(dsState.type)
                    const datasourcePluginState = this.props.datasourcePlugins[dsState.type]
                    return pluginLoaded
                        ? <DatasourceIFrame key={dsState.id} datasourcePluginState={datasourcePluginState} datasourceState={dsState}/>
                        : <div key={dsState.id}>Datasource Loading ...</div>
                })
            }
        </div>
    }
}

export default connect(
    (state: State) => {
        return {
            datasources: state.datasources,
            datasourcePlugins: state.datasourcePlugins
        };
    },
    (dispatch: any) => {
        return {}
    }
)(DatasourceFrames)

interface IDatasourceIFrameProps {
    datasourceState: IDatasourceState
    datasourcePluginState: IDatasourcePluginState
}


class DatasourceIFrame extends React.Component<IDatasourceIFrameProps, void> {

    constructor(props: IDatasourceIFrameProps) {
        super(props)
    }

    componentDidMount() {
        const element: HTMLIFrameElement = this.refs['frame'] as HTMLIFrameElement;

        // TODO: UI is loaded before the datasource is loaded to the registry, this throws then ...
        const dsFactory = Dashboard.getInstance().datasourcePluginRegistry.getPlugin(this.props.datasourceState.type);
        const dsInstance = dsFactory.getInstance(this.props.datasourceState.id)
        dsInstance.iFrame = element;
    }


    // allow-popups allow-same-origin allow-modals allow-forms
    // A sandbox that includes both the allow-same-origin and allow-scripts flags,
    // then the framed page can reach up into the parent, and remove the sandbox attribute entirely.
    // Only if the framed content comes from the same origin of course.

    render() {
        return <iframe id={'frame-' + this.props.datasourceState.id} ref="frame" src={"datasource.html#" + this.props.datasourcePluginState.url} frameBorder="0" width="100%"
                       height="100%"
                       scrolling="no"
                       sandbox="allow-scripts">
            Browser does not support iFrames.
        </iframe>
    };
}
