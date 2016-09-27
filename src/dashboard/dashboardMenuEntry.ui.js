/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import {connect} from 'react-redux'
import * as ui from "../ui/elements.ui";
import * as Modal from '../modal/modalDialog'
import * as ModalIds from '../modal/modalDialogIds'
import {PropTypes as Prop}  from "react";


const DashboardTopNavItem = (props) => {
    return <li
        className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger--hover"
        aria-haspopup="true">
        <a href="javascript:void(0);" className="slds-context-bar__label-action" title="Dashboard">
            <span className="slds-truncate">Board</span>
        </a>
        <div className="slds-context-bar__icon-action slds-p-left--none" tabindex="0">
            <button className="slds-button slds-button--icon slds-context-bar__button" tabindex="-1">
                <svg aria-hidden="true" className="slds-button__icon">
                    <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#chevrondown"></use>
                </svg>
                <span className="slds-assistive-text">Open Board submenu</span>
            </button>
        </div>
        <div className="slds-dropdown slds-dropdown--right">
            <ul className="dropdown__list" role="menu">
                <ui.DropdownItem text="Import / Export"
                                 icon="change_record_type"
                                 onClick={() => props.showModal(ModalIds.DASHBOARD_IMPORT_EXPORT)}
                />
            </ul>
        </div>
    </li>
};

DashboardTopNavItem.propTypes = {
    showModal: Prop.func.isRequired
};

export default connect((state) => {
    return {
        state: state
    }
}, (dispatch) => {
    return {
        showModal: (id) => dispatch(Modal.showModal(id))
    }
})(DashboardTopNavItem);

