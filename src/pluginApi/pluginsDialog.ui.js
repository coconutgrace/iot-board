/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import ModalDialog from '../modal/modalDialog.ui.js'
import {connect} from 'react-redux'
import * as _ from 'lodash'
import {reset} from 'redux-form';
import * as ui from '../ui/elements.ui'
import * as ModalIds from '../modal/modalDialogIds'
import * as Modal from '../modal/modalDialog'
import * as Plugins from '../pluginApi/plugins'
import * as WidgetsPlugins from '../widgets/widgetPlugins'
import * as DatasourcePlugins from '../datasource/datasourcePlugins'
import {PropTypes as Prop}  from "react";

class PluginsModal extends React.Component {

    render() {
        const props = this.props;

        const actions = [
            {
                className: "ui right labeled icon positive button",
                iconClass: "save icon",
                label: "Close",
                onClick: () => {
                    props.closeDialog()
                }
            }
        ];

        const datasourcePluginStates = _.valuesIn(props.datasourcePlugins);
        const widgetPluginStates = _.valuesIn(props.widgetPlugins);

        return <ModalDialog id={ModalIds.PLUGINS}
                            title="Plugins"
                            actions={actions}
        >
            <div className="slds-grid">
                <div className="slds-size--1-of-1">
                    <h2 className="slds-section-title--divider slds-m-bottom--medium">Load Plugin</h2>
                    <form className="slds-form--inline slds-grid"
                          onSubmit={(e) => {
                              props.loadPlugin(this.refs.pluginUrl.value);
                              e.preventDefault()
                          }}
                    >
                        <div className="slds-form-element slds-has-flexi-truncate">
                            <div className="slds-form-element__control slds-size--1-of-1">
                                <div className="slds-input-has-icon slds-input-has-icon--right">
                                    <svg aria-hidden="true" className="slds-input__icon">
                                        <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#search"></use>
                                    </svg>
                                    <input className="slds-lookup__search-input slds-input" type="search" placeholder="URL or Id from Plugin Registry"
                                           id="plugin-url-input" ref="pluginUrl" name="plugin-url"
                                           defaultValue="plugins/TestWidgetPlugin.js"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="slds-form-element slds-no-flex">
                            <button className="slds-button slds-button--brand" type="submit" tabIndex="0">
                                Load&nbsp;Plugin
                            </button>
                        </div>
                    </form>

                    <h4 className="slds-section-title--divider slds-m-top--medium slds-m-bottom--medium">Datasource Plugins (Installed)</h4>
                    <DatasourcePluginList datasourceStates={datasourcePluginStates} {...props} />
                    <h4 className="slds-section-title--divider slds-m-top--medium slds-m-bottom--medium">Widget Plugins (Installed)</h4>
                    <WidgetPluginList widgetPluginStates={widgetPluginStates} {...props} />
                </div>
            </div>
        </ModalDialog>
    }
}

PluginsModal.propTypes = {
    datasourcePlugins: Prop.object.isRequired,
    widgetPlugins: Prop.object.isRequired,
    closeDialog: Prop.func.isRequired,
    loadPlugin: Prop.func.isRequired
};

export default connect(
    (state) => {
        return {
            widgetPlugins: state.widgetPlugins,
            datasourcePlugins: state.datasourcePlugins
        }
    },
    (dispatch) => {
        return {
            closeDialog: () => dispatch(Modal.closeModal()),
            // TODO: Render loading indicator while Plugin loads
            // maybe build some generic solution for Ajax calls where the state can hold all information to render loading indicators / retry buttons etc...
            loadPlugin: (url) => dispatch(Plugins.startLoadingPluginFromUrl(url))
        }
    }
)(PluginsModal);

const DatasourcePluginList = (props) => {
    return <div className="slds-grid slds-grid--vertical-stretch slds-wrap slds-has-dividers--around-space">
        {
            props.datasourceStates.map(dsState => {
                return <DatasourcePluginTile key={dsState.id} pluginState={dsState} {...props}/>;
            })
        }
    </div>
};

DatasourcePluginList.propTypes = {
    datasourceStates: Prop.arrayOf(
        Prop.shape({
            id: Prop.string.isRequired
        })
    ).isRequired
};


const WidgetPluginList = (props) => {
    return <div className="slds-grid slds-grid--vertical-stretch slds-wrap slds-has-dividers--around-space">
        {
            props.widgetPluginStates.map(dsState => {
                return <WidgetPluginTile key={dsState.id} pluginState={dsState} {...props}/>;
            })
        }
    </div>
};

WidgetPluginList.propTypes = {
    widgetPluginStates: Prop.arrayOf(WidgetsPlugins.widgetPluginType)
};


class PluginTile extends React.Component {

    constructor(props) {
        super(props)
        this.state = {actionMenuOpen: false}
    }

    _copyUrl() {
        this.refs.url.focus();
        this.refs.url.select();
        document.execCommand('copy');
    }

    toggleActionMenu() {
        this.setState({actionMenuOpen: !this.state.actionMenuOpen})
    }

    closeActionMenu() {
        this.setState({actionMenuOpen: false})
    }

    render() {
        const props = this.props;
        const pluginState = props.pluginState;
        const description = pluginState.typeInfo.description ? pluginState.typeInfo.description : "No Description."
        const url = pluginState.url ? pluginState.url : "Packaged"

        return <div className="slds-tile slds-item slds-size--1-of-5 slds-m-around--x-small xxslds-p-left--small xxslds-p-right--small" style={{marginTop:"0.5rem"}}>
            <div className="slds-grid slds-grid--align-spread slds-has-flexi-truncate slds-m-bottom--x-small">
                <h3 className="slds-text-heading--medium">{pluginState.typeInfo.name}</h3>
                <div className={"slds-shrink-none slds-dropdown-trigger slds-dropdown-trigger--click" + (this.state.actionMenuOpen ? " slds-is-open" : "")}>
                    <button className="slds-button slds-button--icon-border-filled slds-button--icon-x-small" aria-haspopup="true"
                            onClick={() => this.toggleActionMenu()} onBlur={() => setTimeout(()=>this.closeActionMenu(), 50)}
                    >
                        <svg aria-hidden="true" className="slds-button__icon slds-button__icon--hint">
                            <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#down"></use>
                        </svg>
                        <span className="slds-assistive-text">Actions</span>
                    </button>
                    <div className="slds-dropdown slds-dropdown--left slds-dropdown--actions">
                        <ul className="dropdown__list" role="menu">
                            <li className="slds-dropdown__item" role="presentation">
                                <a href="javascript:void(0);" role="menuitem" tabIndex="0" onClick={() => props.removePlugin(pluginState.id)}>
                                    <svg aria-hidden="true" className="slds-icon slds-icon--x-small slds-icon-text-default slds-m-right--x-small slds-shrink-none">
                                        <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#delete"/>
                                    </svg>
                                    <span className="slds-truncate">Remove</span>

                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="slds-tile__detail">
                <dl className="slds-dl--horizontal">
                    <dt className="slds-dl--horizontal__label">
                        <p className="slds-truncate" title="Type">Type:</p>
                    </dt>
                    <dd className="slds-dl--horizontal__detail slds-tile__meta">
                        <p className="slds-truncate" title={pluginState.typeInfo.type}>{pluginState.typeInfo.type}</p>
                    </dd>
                    <dt className="slds-dl--horizontal__label">
                        <p className="slds-truncate" title="Type">Url:</p>
                    </dt>
                    <dd className="slds-dl--horizontal__detail slds-tile__meta">
                        <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon--left" title={url}>
                            <svg aria-hidden="true" className="slds-input__icon slds-icon-text-default"
                                 onClick={() => this._copyUrl()}>
                                <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#copy"></use>
                            </svg>
                            <input className="slds-input" type="text" ref="url"
                                   readOnly
                                   style={{width: "100%", paddingRight: 0}}
                                   placeholder="Plugin Url ..."
                                   defaultValue={url}/>
                        </div>
                    </dd>
                </dl>
                <p>{description}</p>
            </div>
        </div>
    }
}

PluginTile.propTypes = {
    pluginState: Prop.object.isRequired,
    removePlugin: Prop.func.isRequired
};

const WidgetPluginTile = connect(
    state => {
        return {}
    },
    dispatch => {
        return {
            removePlugin: (type) => dispatch(WidgetsPlugins.unloadPlugin(type))
        }
    }
)(PluginTile);

const DatasourcePluginTile = connect(
    state => {
        return {}
    },
    dispatch => {
        return {
            removePlugin: (type) => dispatch(DatasourcePlugins.unloadPlugin(type))
        }
    }
)(PluginTile);
