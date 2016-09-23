/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import {connect} from 'react-redux'
import * as WidgetConfig from './widgetConfig'
import * as WidgetPlugins from './widgetPlugins'
import {deleteWidget} from './widgets'
import * as Widgets from './widgets'
import {PropTypes as Prop}  from "react";
import Dashboard from '../dashboard'

/**
 * The Dragable Frame of a Widget.
 * Contains generic UI controls, shared by all Widgets
 */
const WidgetFrame = (props) => {
    const widgetState = props.widget;

    // If the plugin is not in the registry, we assume it's currently loading
    const pluginLoaded = Dashboard.getInstance().widgetPluginRegistry.hasPlugin(widgetState.type)


    let widgetFactory;
    if (pluginLoaded) {
        widgetFactory = Dashboard.getInstance().widgetPluginRegistry.getPlugin(widgetState.type);
    }


    return (
        <div className="lob-shadow--raised slds-card"
             style={{margin: 0, overflow: "hidden", backgroundColor: "#fff"}}
             key={widgetState.id}
             _grid={{x: widgetState.col, y: widgetState.row, w: widgetState.width, h: widgetState.height}}>
            <div className="slds-grid slds-wrap slds-has-dividers--bottom" style={{height: "100%"}}>
                <div className={"slds-size--1-of-1 slds-item" + (props.isReadOnly ? "" : " drag")} style={{padding: 8}}>
                    {props.isReadOnly ? null :
                        <div className="slds-float--right">

                            <ConfigWidgetButton widgetState={widgetState}
                                                description="settings"
                                                visible={(props.widgetPlugin && props.widgetPlugin.typeInfo.settings ? true : false)}
                                                icon="settings"/>
                            {/* <!--<a className="right item drag">
                             <i className="move icon drag"></i>
                             </a>*/}
                            <DeleteWidgetButton widgetState={widgetState}
                                                description="remove"
                                                icon="remove" iconType="action"/>


                        </div>
                    }
                    <div className={"" + (props.isReadOnly ? "" : " drag")}>
                        {widgetState.settings.name || "\u00a0"}
                    </div>
                </div>

                {/* Actual widget content*/}
                <div className="slds-size--1-of-1 slds-is-relative"
                     style={{height: widgetState.availableHeightPx, padding: 0, border: "red dashed 0px"}}>
                    {
                        pluginLoaded ? widgetFactory.getInstance(widgetState.id)
                            : <LoadingWidget widget={widgetState}/>
                    }
                </div>
            </div>
        </div>)
};

export const widgetPropType = Prop.shape({
    id: Prop.string.isRequired,
    col: Prop.number.isRequired,
    row: Prop.number.isRequired,
    width: Prop.number.isRequired,
    height: Prop.number.isRequired,
    settings: Prop.shape({
        name: Prop.string.isRequired
    }).isRequired
});

WidgetFrame.propTypes = {
    widget: widgetPropType.isRequired,
    widgetPlugin: WidgetPlugins.widgetPluginType.isRequired,
    isReadOnly: Prop.bool.isRequired
};


export default WidgetFrame;

const LoadingWidget = (props) => {
    return <div className="slds-is-relative" style={{height: "100%", padding: "10px"}}>
        Loading {props.widget.type} Widget ...
        <div className="slds-spinner_container">
            <div className="slds-spinner slds-spinner--medium" role="alert">
                <span className="slds-assistive-text">Loading</span>
                <div className="slds-spinner__dot-a"></div>
                <div className="slds-spinner__dot-b"></div>
            </div>
        </div>
    </div>
};

LoadingWidget.propTypes = {
    widget: widgetPropType.isRequired
};

class WidgetButton extends React.Component {
    render() {
        const iconType = this.props.iconType || "utility"
        const data = this.props.widgetState;
        return <button className={"slds-button slds-button--icon no-drag" + (this.props.visible !== false ? "" : " slds-hide")}>
            <svg aria-hidden="true" className="slds-button__icon slds-button__icon--small"
                 onClick={() => this.props.onClick(data)}
            >
                <use xlinkHref={"/assets/icons/" + iconType + "-sprite/svg/symbols.svg#" + this.props.icon}></use>
            </svg>
            <span className="slds-assistive-text">{this.props.description}</span>
        </button>
    }
}

WidgetButton.propTypes = {
    widgetState: widgetPropType.isRequired,
    icon: Prop.string.isRequired,
    description: Prop.string,
    iconType: Prop.string,
    visible: Prop.bool,
    className: Prop.string.isRequired,
    onClick: Prop.func.isRequired
};

const DeleteWidgetButton = connect(
    (state) => {
        return {}
    },
    (dispatch) => {
        return {
            onClick: (widgetState) => {
                dispatch(deleteWidget(widgetState.id))
            }
        };
    }
)(WidgetButton);

const ConfigWidgetButton = connect(
    (state) => {
        return {}
    },
    (dispatch) => {
        return {
            onClick: (widgetState) => {
                dispatch(WidgetConfig.openWidgetConfigDialog(widgetState.id))
            }
        };
    }
)(WidgetButton);
