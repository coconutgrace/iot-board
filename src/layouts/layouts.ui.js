/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import {connect} from 'react-redux'
import * as _ from 'lodash'
import * as Layouts from './layouts'
import * as ui from '../ui/elements.ui'
import {PropTypes as Prop}  from "react";

const LayoutsTopNavItem = (props) => {
    return <li
        className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger--hover"
        aria-haspopup="true">
        <a href="javascript:void(0);" className="slds-context-bar__label-action" title="Menu Item">
            <span className="slds-truncate">Layout</span>
        </a>
        <div className="slds-context-bar__icon-action slds-p-left--none" tabindex="0">
            <button className="slds-button slds-button--icon slds-context-bar__button" tabindex="-1">
                <svg aria-hidden="true" className="slds-button__icon">
                    <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#chevrondown"></use>
                </svg>
                <span className="slds-assistive-text">Open Layout submenu</span>
            </button>
        </div>
        <div className="slds-dropdown slds-dropdown--right">
            <ul className="dropdown__list" role="menu">
                <SaveLayout/>
                <ResetLayoutButton text="Reset Current Layout" icon="undo"/>
                <SaveLayoutButton text="Save Layout" icon="package"/>
                <li className="slds-dropdown__header slds-has-divider--top-space" role="separator">
                    <span className="slds-text-title--caps">Layouts</span>
                </li>
                {props.layouts.map(layout => {
                    return <LayoutItem text={layout.name} icon="plus" layout={layout}
                                       key={layout.id}/>
                })}
            </ul>
        </div>
    </li>
};

LayoutsTopNavItem.propTypes = {
    layouts: Prop.arrayOf(
        Prop.shape({
            name: Prop.string
        })
    ),
    widgets: Prop.object,
    currentLayout: Prop.object
};

export default connect((state) => {
        return {
            layouts: _.valuesIn(state.layouts),
            currentLayout: state.currentLayout,
            widgets: state.widgets
        }
    },
    (dispatch)=> {
        return {}
    })(LayoutsTopNavItem);

class SaveInput extends React.Component {
    onEnter(e) {
        if (e.key === 'Enter') {
            this.save()
        }
    }

    save() {
        this.props.onEnter(this.refs.input.value, this.props);
        this.refs.input.value = '';
    }

    render() {
        return <div className="slds-form-element">
            <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon--right">
                <svg aria-hidden="true" className="slds-input__icon slds-icon-text-default"
                     onClick={() => this.save()}
                >
                    <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#add"></use>
                </svg>
                <input id="text-input-save-layout" className="slds-input" type="text" placeholder="Save as ..."
                       ref="input"
                       onKeyPress={this.onEnter.bind(this)}
                />
            </div>
        </div>
    }
}

SaveInput.propTypes = {
    onEnter: Prop.func,
    widgets: Prop.object
};

const SaveLayout = connect((state) => {
        return {
            layouts: _.valuesIn(state.layouts),
            widgets: state.widgets
        }
    },
    (dispatch, props)=> {
        return {
            onEnter: (name, props) => {
                dispatch(Layouts.addLayout(name, props.widgets))
            }
        }
    }
)(SaveInput);

class MyLayoutItem extends React.Component {
    render() {
        const props = this.props;
        let selected = props.currentLayout.id == props.layout.id;
        return <ui.DropdownItem onClick={() => props.onClick(props)}
                             selected={selected}
                             isCheckbox="true"
                             icon="check" iconRight="delete"
                             iconRightClick={() => {
                                 props.deleteLayout(props);
                             }} text={props.text}/>
    }
}

MyLayoutItem.propTypes = {
    deleteLayout: Prop.func.isRequired,
    onClick: Prop.func.isRequired,
    layout: Prop.object.isRequired,
    currentLayout: Prop.object
};

const LayoutItem = connect(
    (state) => {
        return {
            currentLayout: state.currentLayout
        }
    },
    (dispatch, props)=> {
        return {
            deleteLayout: (props) => dispatch(Layouts.deleteLayout(props.layout.id)),
            onClick: (props) => dispatch(Layouts.loadLayout(props.layout.id))
        }
    }
)(MyLayoutItem);



const ResetLayoutButton = connect(
    (state) => {
        return {
            id: state.currentLayout.id,
            disabled: !state.currentLayout.id
        }
    },
    (dispatch, props)=> {
        return {
            onClick: (props) => dispatch(Layouts.loadLayout(props.id))
        }
    }
)(ui.DropdownItem);

const SaveLayoutButton = connect(
    (state) => {
        return {
            id: state.currentLayout.id,
            widgets: state.widgets,
            disabled: !state.currentLayout.id
        }
    },
    (dispatch)=> {
        return {
            onClick: (props) => dispatch(Layouts.updateLayout(props.id, props.widgets))
        }
    }
)(ui.DropdownItem);



