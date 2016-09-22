/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from "react";
import {Component, KeyboardEvent} from "react";
import * as ReactDOM from "react-dom";
import {connect} from "react-redux";
import * as Global from "./dashboard/global.js";
import WidgetGrid from "./widgets/widgetGrid.ui.js";
import LayoutsNavItem from "./layouts/layouts.ui.js";
import WidgetConfigDialog from "./widgets/widgetConfigDialog.ui.js";
import DashboardMenuEntry from "./dashboard/dashboardMenuEntry.ui.js";
import ImportExportDialog from "./dashboard/importExportDialog.ui.js";
import DatasourceConfigDialog from "./datasource/datasourceConfigDialog.ui.js";
import DatasourceNavItem from "./datasource/datasourceNavItem.ui.js";
import WidgetsNavItem from "./widgets/widgetsNavItem.ui.js";
import PluginNavItem from "./pluginApi/pluginNavItem.ui.js";
import PluginsDialog from "./pluginApi/pluginsDialog.ui.js";
import * as Persistence from "./persistence";
import {IConfigState} from "./config";
import {DashboardStore} from "./store";
import {State, IModalDialogState} from "./appState";

interface LayoutProps {
    setReadOnly(readOnly: boolean): void
    isReadOnly: boolean
    devMode: boolean
    config: IConfigState
}

interface LayoutState {
    hover: boolean;
}

export class Layout extends Component<LayoutProps, LayoutState> {

    constructor(props: LayoutProps) {
        super(props);
        this.state = {hover: false};
    }

    onReadOnlyModeKeyPress(e: KeyboardEvent) {
        //console.log("key pressed", event.keyCode);
        const intKey = (window.event) ? e.which : e.keyCode;
        if (intKey === 27) {
            this.props.setReadOnly(!this.props.isReadOnly);
        }
    }

    componentDidMount() {
        if (this.props.devMode) {
            this.onReadOnlyModeKeyPress = this.onReadOnlyModeKeyPress.bind(this);

            ReactDOM.findDOMNode<any>(this)
                .offsetParent
                .addEventListener('keydown', this.onReadOnlyModeKeyPress);
        }
    }

    render() {
        const props = this.props;

        const showMenu = props.devMode && (!props.isReadOnly || this.state.hover);

        return <div onKeyUp={(event) => this.onReadOnlyModeKeyPress(event)}>
            <div>
                <WidgetConfigDialog/>
                <ImportExportDialog/>
                <DatasourceConfigDialog/>
                <PluginsDialog/>
            </div>
            <div className="container">
                <div className={showMenu ? "menu-trigger" : "menu-trigger"}
                     onMouseOver={()=> { this.setState({hover:true})}}
                     onMouseEnter={()=> {this.setState({hover:true})}}

                ></div>
                <div className={"ui inverted fixed main menu " + (showMenu ? "topnav--visible" : "topnav--hidden")}
                     onMouseOver={()=> { this.setState({hover:true})}}
                     onMouseLeave={()=> {this.setState({hover:false})}}
                >
                    <div className="ui container">
                        <a href="#" className="header item">
                            {/*<img className="logo" src="assets/images/logo.png"/>*/}
                            Dashboard
                        </a>

                        <DashboardMenuEntry/>
                        <WidgetsNavItem/>
                        <DatasourceNavItem/>
                        <PluginNavItem/>
                        <LayoutsNavItem/>
                        <a className="item" onClick={() => Persistence.clearData()}>
                            <i className="red bomb icon"/>
                            Reset Everything!
                        </a>
                        <a className="item" onClick={() => props.setReadOnly(!props.isReadOnly)}>
                            <i className={ (props.isReadOnly ? "lock" : "unlock alternate")  + " icon"}/> {/*expand*/}
                        </a>
                        <div className="header selectable right item">
                            v{this.props.config.version}&nbsp;{this.props.config.revisionShort}
                        </div>
                        {props.config.auth && props.config.auth.username ?
                            <div className="header selectable right item">{props.config.auth.username}</div>
                            : null
                        }
                        {props.config.auth && props.config.auth.logoutUrl ?
                            <div className="header selectable right item">
                                <a className="ui button" href={props.config.auth.logoutUrl}>Logout</a>
                            </div>
                            : null
                        }

                    </div>

                </div>

                {/* TODO: Use custom classes for everything inside the Grid to make it customizable without breaking semantic-ui */}
                <div className="ui grid">
                    <WidgetGrid/>
                </div>
            </div>
        </div>
    }

}

export default connect(
    (state: State) => {
        return {
            isReadOnly: state.global.isReadOnly,
            devMode: state.config.devMode,
            config: state.config
        };
    },
    (dispatch: any) => {
        return {
            setReadOnly: (isReadOnly: boolean) => dispatch(Global.setReadOnly(isReadOnly))
        };
    }
)(Layout);

interface UserNavItemProps {
    username: string
    logoutUrl: string
}

interface UserNavItemState {
}

class UserNavItem extends React.Component<UserNavItemProps, UserNavItemState> {

    render() {
        return <div>
            <div className="header selectable right item">Tobias</div>
            <div className="header selectable right item">
                <a className="ui button">Logout</a>
            </div>
        </div>
    }
}
