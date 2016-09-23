/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import * as Datasource from "./datasource";
import {connect} from "react-redux";
import * as _ from 'lodash'
import * as ui from "../ui/elements.ui";
import {reset} from "redux-form";
import {PropTypes as Prop}  from "react";


const DatasourceTopNavItem = (props) => {
    return <li
        className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger--hover"
        aria-haspopup="true">
        <a href="javascript:void(0);" className="slds-context-bar__label-action" title="Menu Item">
            <span className="slds-truncate">Datasources</span>
        </a>
        <div className="slds-context-bar__icon-action slds-p-left--none" tabindex="0">
            <button className="slds-button slds-button--icon slds-context-bar__button" tabindex="-1">
                <svg aria-hidden="true" className="slds-button__icon">
                    <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#chevrondown"></use>
                </svg>
                <span className="slds-assistive-text">Open Datasources submenu</span>
            </button>
        </div>
        <div className="slds-dropdown slds-dropdown--right">
            <ul className="dropdown__list" role="menu">
                <ui.DropdownItem
                    text="Add Datasource"
                    icon="add"
                    onClick={() => props.createDatasource()}
                />
                <li className="slds-dropdown__header slds-has-divider--top-space" role="separator">
                    <span className="slds-text-title--caps">Datasources</span>
                </li>
                {_.valuesIn(props.datasources).map(ds => {
                    return <ui.DropdownItem key={ds.id}
                        text={ds.settings.name}
                        iconRight="delete"
                        iconRightClick={() => props.deleteDatasource(ds.id)}
                        onClick={() => props.editDatasource(ds.id)}
                    />
                })}
            </ul>
        </div>
    </li>
};

DatasourceTopNavItem.propTypes = {
    createDatasource: Prop.func.isRequired,
    editDatasource: Prop.func.isRequired,
    deleteDatasource: Prop.func.isRequired,
    datasources: Prop.objectOf(
        Prop.shape({
            type: Prop.string.isRequired,
            id: Prop.string.isRequired,
            settings: Prop.object.isRequired
        })
    ).isRequired
};

export default connect(
    (state) => {
        return {
            datasources: state.datasources
        }
    },
    (dispatch) => {
        return {
            createDatasource: () => dispatch(Datasource.startCreateDatasource()),
            editDatasource: (id) => dispatch(Datasource.startEditDatasource(id)),
            deleteDatasource: (id) => dispatch(Datasource.deleteDatasource(id))
        }
    }
)(DatasourceTopNavItem);
