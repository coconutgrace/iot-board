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
import PluginNavItem from "./pluginApi/pluginNavItem.ui";
import PluginsDialog from "./pluginApi/pluginsDialog.ui";
import * as Persistence from "./persistence";
import {IConfigState} from "./config";
import {State} from "./appState";

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
        const devMode = true;
        const showMenu = props.devMode && (!props.isReadOnly || this.state.hover);

        return <div className="slds-grid slds-wrap" onKeyUp={(event) => this.onReadOnlyModeKeyPress(event)}>
            <div>
                <WidgetConfigDialog/>
                <ImportExportDialog/>
                <DatasourceConfigDialog/>
                <PluginsDialog/>
            </div>
            <div className={showMenu ? "menu-trigger" : "menu-trigger"}
                 onMouseOver={()=> { this.setState({hover:true})}}
                 onMouseEnter={()=> {this.setState({hover:true})}}
            />

            {devMode ?
                <div className={"slds-size--1-of-1 slds-context-bar" + (showMenu ? " topnav--visible" : " topnav--hidden")}
                     onMouseOver={()=> { this.setState({hover:true})}}
                     onMouseLeave={()=> {this.setState({hover:false})}}
                >
                    <div className="slds-context-bar__primary slds-context-bar__item--divider-right">
                        <div className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger--click slds-no-hover">
                            <span className="slds-context-bar__label-action slds-context-bar__app-name">
                                <span className="slds-truncate"><a href="http://iot-dashboard.org"> IoT-Dashboard</a></span>
                            </span>
                        </div>
                    </div>
                    <div className="slds-context-bar__secondary" role="navigation">
                        <ul className="slds-grid">
                            <DashboardMenuEntry/>
                            <WidgetsNavItem/>
                            <DatasourceNavItem/>
                            <PluginNavItem/>
                            <LayoutsNavItem/>
                            <div className="slds-context-bar__vertical-divider"/>
                            <li className="slds-context-bar__item">
                                <a href="javascript:void(0);" onClick={() => Persistence.clearData()}
                                   className="slds-context-bar__label-action" title="Reset Everything!">
                                    <span className="slds-truncate">Reset Everything!</span>
                                </a>
                            </li>

                            <li className="slds-context-bar__item">
                                <div className="slds-context-bar__icon-action"
                                     onClick={() => props.setReadOnly(!props.isReadOnly)}
                                >
                                    <svg aria-hidden="true"
                                         className="slds-icon slds-icon--small slds-icon-text-default">
                                        <use
                                            xlinkHref={"assets/icons/utility-sprite/svg/symbols.svg#" + (props.isReadOnly ? "lock" : "unlock")}/>
                                    </svg>
                                    <span className="slds-assistive-text">Lock / Unlock</span>
                                </div>
                            </li>

                        </ul>
                    </div>
                    <div className="slds-context-bar__tertiary">
                        <ul className="slds-grid slds-grid--vertical-align-center">

                            {props.config.auth && props.config.auth.username ?
                                <div className="slds-m-right--small">Tobias</div>
                                : null
                            }
                            {props.config.auth && props.config.auth.logoutUrl ?
                                <a className="slds-button slds-button--neutral"
                                   href={props.config.auth.logoutUrl}
                                >
                                    <svg aria-hidden="true" className="slds-button__icon slds-button__icon--left">
                                        <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#logout"/>
                                    </svg>
                                    Logout
                                </a>
                                : null
                            }

                            <div className="slds-context-bar__vertical-divider"/>
                            <span className="slds-truncate slds-m-left--small">
                            v{this.props.config.version}
                        </span>
                        </ul>
                    </div>
                </div>
                : null }

            <div className="slds-size--1-of-1">
                <WidgetGrid/>
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
