/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from "react";
import ModalDialog from "../modal/modalDialog.ui";
import {connect} from "react-redux";
import * as _ from "lodash";
import * as Modal from "../modal/modalDialog.js";
import * as Config from "../config";
import * as Plugins from "../pluginApi/pluginLoader";
import * as WidgetsPlugins from "../widgets/widgetPlugins";
import {IWidgetPluginsState, IWidgetPluginState} from "../widgets/widgetPlugins";
import * as DatasourcePlugins from "../datasource/datasourcePlugins";
import {IDatasourcePluginsState, IDatasourcePluginState} from "../datasource/datasourcePlugins";
import {Dispatch, State} from "../appState";
import FormEvent = __React.FormEvent;
import {ITypeInfo} from "./pluginRegistry";

interface PluginsModalProps {
    datasourcePlugins: IDatasourcePluginsState
    widgetPlugins: IWidgetPluginsState
    pluginRegistryApiKey: string
    pluginRegistryUrl: string
    closeDialog: () => void
    loadPlugin: (url: string) => void
    setConfigValue: (key: string, value: any) => void
}

interface PluginsModalState {
    pluginUrl?: string
    isSearchOpen?: boolean
}

class PluginsModal extends React.Component<PluginsModalProps, PluginsModalState> {

    constructor(props: PluginsModalProps) {
        super(props)
        this.state = {
            pluginUrl: "",
            isSearchOpen: false
        }
    }

    pluginSearchValueChange(e: FormEvent) {
        const pluginUrlInput: any = this.refs['pluginUrl'] // HTMLInputElement
        this.setState({pluginUrl: pluginUrlInput.value});
    }

    onBlurPluginSearchInput(e: FormEvent) {
        setTimeout(() => {
            this.setState({isSearchOpen: false});
        }, 300)

    }

    onFocusPluginSearchInput(e: FormEvent) {
        this.setState({isSearchOpen: true});
    }

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
        const pluginUrlInput: any = this.refs['pluginUrl'] // HTMLInputElement

        return <ModalDialog id="plugins-dialog"
                            title="Plugins"
                            actions={actions}
        >
            <div className="slds-grid">
                <div className="slds-size--1-of-1">
                    <h2 className="slds-section-title--divider slds-m-bottom--medium">
                        Load Plugin <PluginRegistrySettings
                        pluginRegistryApiKey={props.pluginRegistryApiKey}
                        pluginRegistryUrl={props.pluginRegistryUrl}
                        onApiKeyChanged={(key) => this.props.setConfigValue("pluginRegistryApiKey", key)}
                        onRegistryUrlChanged={(url) =>  this.props.setConfigValue("pluginRegistryUrl", url)}
                    />
                    </h2>
                    <form className="slds-form--inline slds-grid"
                          onSubmit={(e) => {
                              props.loadPlugin(pluginUrlInput.value);
                              pluginUrlInput.value = ""
                              e.preventDefault()
                          }}
                    >
                        <div className={"slds-form-element slds-has-flexi-truncate slds-lookup" + (this.state.isSearchOpen ? " slds-is-open" : "")} data-select="single">
                            <div className="slds-form-element__control slds-size--1-of-1">
                                <div className="slds-input-has-icon slds-input-has-icon--right">
                                    <svg aria-hidden="true" className="slds-input__icon">
                                        <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#search"></use>
                                    </svg>
                                    <input className="slds-lookup__search-input slds-input" type="search" placeholder="URL or Id from Plugin Registry"
                                           id="plugin-lookup-menu" ref="pluginUrl" autoComplete="off"
                                           defaultValue=""
                                           onChange={(e) => this.pluginSearchValueChange(e)}
                                           onBlur={(e) => this.onBlurPluginSearchInput(e)}
                                           onFocus={(e) => this.onFocusPluginSearchInput(e)}
                                           aria-owns="plugin-lookup-menu" role="combobox" aria-activedescendent=""
                                           aria-expanded={(this.state.isSearchOpen ? "true" : "false")} aria-autocomplete="list"
                                    />
                                </div>
                            </div>
                            <LookupMenu id="plugin-lookup-menu" searchString={this.state.pluginUrl}
                                        onItemClicked={(item: ITypeInfo) => props.loadPlugin('plugin://' + item.type)}
                            />
                        </div>
                        <div className="slds-form-element slds-no-flex">
                            <button className="slds-button slds-button--brand" type="submit" tabIndex="0">
                                Load&nbsp;Plugin
                            </button>
                        </div>

                    </form>

                    <h4 className="slds-section-title--divider slds-m-top--medium slds-m-bottom--medium">Datasource Plugins (Installed)</h4>
                    <div className="slds-grid slds-grid--vertical-stretch slds-wrap slds-has-dividers--around-space">
                        {datasourcePluginStates.map(dsState => {
                            return <DatasourcePluginTile key={dsState.id} pluginId={dsState.id}/>;
                        })}
                    </div>
                    <h4 className="slds-section-title--divider slds-m-top--medium slds-m-bottom--medium">Widget Plugins (Installed)</h4>
                    <div className="slds-grid slds-grid--vertical-stretch slds-wrap slds-has-dividers--around-space">
                        {widgetPluginStates.map(dsState => {
                            return <WidgetPluginTile key={dsState.id} pluginId={dsState.id}/>;
                        })}
                    </div>
                </div>
            </div>
        </ModalDialog>
    }
}

export default connect(
    (state: State) => {
        return {
            widgetPlugins: state.widgetPlugins,
            datasourcePlugins: state.datasourcePlugins,
            pluginRegistryApiKey: state.config.pluginRegistryApiKey,
            pluginRegistryUrl: state.config.pluginRegistryUrl
        }
    },
    (dispatch: Dispatch) => {
        return {
            closeDialog: () => dispatch(Modal.closeModal()),
            // TODO: Render loading indicator while Plugin loads
            // maybe build some generic solution for Ajax calls where the state can hold all information to render loading indicators / retry buttons etc...
            loadPlugin: (url: string) => dispatch(Plugins.startLoadingPluginFromUrl(url)),
            setConfigValue: (key: string, value: any) => dispatch(Config.setConfigValue(key, value))
        }
    }
)
(PluginsModal);


class PluginTileProps {
    pluginId: string
    pluginState: IDatasourcePluginState & IWidgetPluginState
    removePlugin: (type: string) => any
    publishPlugin: (type: string) => void
}

class PluginTile extends React.Component<PluginTileProps, any> {

    constructor(props: PluginTileProps) {
        super(props)
        this.state = {actionMenuOpen: false}
    }

    _copyUrl() {
        const urlInput: any = this.refs['url'];
        urlInput.focus();
        urlInput.select();
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

        return <div className="slds-tile slds-item slds-size--1-of-5 slds-m-around--x-small" style={{marginTop: "0.5rem"}}>
            <div className="slds-grid slds-grid--align-spread slds-has-flexi-truncate slds-m-bottom--x-small">
                <h3 className="slds-text-heading--medium">{pluginState.typeInfo.name}</h3>
                <div className={"slds-shrink-none slds-dropdown-trigger slds-dropdown-trigger--click" + (this.state.actionMenuOpen ? " slds-is-open" : "")}>
                    <button className="slds-button slds-button--icon-border-filled slds-button--icon-x-small" aria-haspopup="true"
                            onClick={() => this.toggleActionMenu()} onBlur={() => setTimeout(()=>this.closeActionMenu(), 200)}
                    >
                        <svg aria-hidden="true" className="slds-button__icon slds-button__icon--hint">
                            <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#down"></use>
                        </svg>
                        <span className="slds-assistive-text">Actions</span>
                    </button>
                    <div className="slds-dropdown slds-dropdown--left slds-dropdown--actions">
                        <ul className="dropdown__list" role="menu">
                            <li className="slds-dropdown__item" role="presentation">
                                <a href="javascript:void(0);" role="menuitem" tabIndex="0" onClick={() => props.publishPlugin(pluginState.id)}>
                                    <svg aria-hidden="true" className="slds-icon slds-icon--x-small slds-icon-text-default slds-m-right--x-small slds-shrink-none">
                                        <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#upload"/>
                                    </svg>
                                    <span className="slds-truncate">Publish</span>
                                </a>
                            </li>
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
                        <p className="slds-truncate" title="Version">Version:</p>
                    </dt>
                    <dd className="slds-dl--horizontal__detail slds-tile__meta">
                        <p className="slds-truncate" title={pluginState.typeInfo.version}>{pluginState.typeInfo.version}</p>
                    </dd>

                    <dt className="slds-dl--horizontal__label">
                        <p className="slds-truncate" title="Author">Author:</p>
                    </dt>
                    <dd className="slds-dl--horizontal__detail slds-tile__meta">
                        <p className="slds-truncate" title={pluginState.typeInfo.author}>{pluginState.typeInfo.author}</p>
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
                                   value={url}/>
                        </div>
                    </dd>
                </dl>
                <p className="slds-m-top--x-small">{description}</p>
            </div>
        </div>
    }
}


const WidgetPluginTile = connect(
    (state: State, ownProps: any) => {
        return {
            pluginState: state.widgetPlugins[ownProps.pluginId]
        }
    },
    (dispatch: Dispatch) => {
        return {
            removePlugin: (type: string) => dispatch(WidgetsPlugins.unloadPlugin(type)),
            publishPlugin: (type: string) => dispatch(Plugins.publishPlugin(type))
        }
    }
)(PluginTile);

const DatasourcePluginTile = connect(
    (state: State, ownProps: any) => {
        return {
            pluginState: state.datasourcePlugins[ownProps.pluginId]
        }
    },
    (dispatch: Dispatch) => {
        return {
            removePlugin: (type: string) => dispatch(DatasourcePlugins.unloadPlugin(type)),
            publishPlugin: (type: string) => dispatch(Plugins.publishPlugin(type))
        }
    }
)(PluginTile);


interface LookupMenuProps {
    id: string
    searchString: string
    onItemClicked(item: ITypeInfo): void
}

interface LookupMenuState {
    searchResult: ITypeInfo[]
}

class LookupMenu extends React.Component<LookupMenuProps, LookupMenuState> {

    constructor(props: LookupMenuProps) {
        super(props)
        this.state = {
            searchResult: []
        }
    }

    componentWillReceiveProps(nextProps: LookupMenuProps) {
        if (!nextProps.searchString) {
            this.setState({
                searchResult: []
            })
            return;
        }

        fetch("http://localhost:8081/api/plugins/?q=" + nextProps.searchString)
            .then((result) => {
                return result.json()
            })
            .then((json: any) => {
                this.setState({
                    searchResult: json.plugins
                })
            })
    }

    render() {
        const props = this.props;

        /*Icons for Widget = dashboard, report, poll / Datasource = feed */

        return <div className="slds-lookup__menu" id={props.id}>
            <ul className="slds-lookup__list" role="presentation">
                <li role="presentation">
                    <span className="slds-lookup__item-action slds-lookup__item-action--label" id={props.id + "-header"} role="option">
                      <svg aria-hidden="true" className="slds-icon slds-icon--x-small slds-icon-text-default">
                        <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#search"></use>
                      </svg>
                      <span className="slds-truncate">&quot;{props.searchString}&quot; in plugin registry</span>
                    </span>
                </li>
                {
                    this.state.searchResult.map((item, i) => {
                        return <li role="presentation" key={item.type}
                                   onClick={(e) => this.props.onItemClicked(item)}
                        >
                            <span className="slds-lookup__item-action slds-media slds-media--center" id={props.id + "-" + i} role="option">
                              <svg aria-hidden="true" className="slds-icon slds-icon-standard-account slds-icon--small slds-media__figure">
                                <use xlinkHref="/assets/icons/standard-sprite/svg/symbols.svg#dashboard"></use>
                              </svg>
                              <div className="slds-media__body">
                                <div className="slds-lookup__result-text"><mark>{item.name}</mark> ({item.type})</div>
                                <span className="slds-lookup__result-meta slds-text-body--small">DS/Widget • by {item.author} • {item.description}</span>
                              </div>
                            </span>
                        </li>
                    })
                }
            </ul>
        </div>
    }
}

interface RegistrySettingsProps {
    pluginRegistryApiKey: string
    pluginRegistryUrl: string
    onRegistryUrlChanged(value: string): void
    onApiKeyChanged(value: string): void
}

interface RegistrySettingsState {
    actionMenuOpen: boolean
}

class PluginRegistrySettings extends React.Component<RegistrySettingsProps, RegistrySettingsState> {

    private timeout: number

    constructor(props: RegistrySettingsProps) {
        super(props)
        this.state = {actionMenuOpen: false}
    }

    toggleActionMenu() {
        this.clearTimeout()
        this.setState({actionMenuOpen: !this.state.actionMenuOpen})
    }

    closeActionMenu() {
        this.clearTimeout()
        this.setState({actionMenuOpen: false})
    }

    closeActionMenuIn(ms: number) {
        this.clearTimeout()
        this.timeout = setTimeout(() => this.closeActionMenu(), ms)
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    onRegistryUrlChanged(e: FormEvent) {
        const target: any = e.target;
        this.props.onRegistryUrlChanged(target.value)
    }

    onApiKeyChanged(e: FormEvent) {
        const target: any = e.target;
        this.props.onApiKeyChanged(target.value)
    }

    render() {
        return <div className={"slds-shrink-none slds-dropdown-trigger slds-dropdown-trigger--click" + (this.state.actionMenuOpen ? " slds-is-open" : "")}>
            <button className="slds-button slds-button--icon-border-filled slds-button--icon-x-small" aria-haspopup="true"
                    onClick={() => this.toggleActionMenu()} onBlur={() => this.closeActionMenuIn(200)}
            >
                <svg aria-hidden="true" className="slds-button__icon slds-button__icon--hint">
                    <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#settings"></use>
                </svg>
                <span className="slds-assistive-text">Actions</span>
            </button>
            <div className="slds-dropdown slds-dropdown--left slds-dropdown--large">
                <ul className="dropdown__list" role="menu">
                    <li className="slds-dropdown__item" role="presentation">
                        <span className="slds-truncate slds-m-around--x-small">Registry Url</span>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                        <div className="slds-form-element__control">
                            <input className="slds-input" type="text" placeholder="http://dashboard.lobaro.com"
                                   defaultValue={this.props.pluginRegistryUrl}
                                   onFocus={() => this.clearTimeout()}
                                   onBlur={() => this.closeActionMenuIn(200)}
                                   onChange={(e) => this.onRegistryUrlChanged(e)}
                            />
                        </div>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                        <span className="slds-truncate slds-m-around--x-small">Api Key</span>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                        <div className="slds-form-element__control">
                            <input className="slds-input" type="text" placeholder="Api Key"
                                   defaultValue={this.props.pluginRegistryApiKey}
                                   onFocus={() => this.clearTimeout()}
                                   onBlur={() => this.closeActionMenuIn(200)}
                                   onChange={(e) => this.onApiKeyChanged(e)}
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    }
}
