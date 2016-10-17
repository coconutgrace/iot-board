/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import {connect} from 'react-redux'
import * as ModalIds from '../modal/modalDialogIds'
import * as Modal from '../modal/modalDialog.js'
import {State, Dispatch} from "../appState";

interface PluginsTopNavItemProps {
    showPluginsDialog: () => void
}


const PluginsTopNavItem = (props: PluginsTopNavItemProps) => {
    return <li className="slds-context-bar__item">
        <a href="javascript:void(0);"  onClick={() => props.showPluginsDialog()} className="slds-context-bar__label-action" title="Plugins">
            <span className="slds-truncate">Plugin Manager</span>
        </a>
    </li>
};

export default connect(
    (state: State) => {
        return {}
    },
    (dispatch: Dispatch) => {
        return {
            showPluginsDialog: () => {
                dispatch(Modal.showModal(ModalIds.PLUGINS))
            }
        }
    }
)(PluginsTopNavItem);
