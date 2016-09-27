/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from "react";
import {PropTypes as Prop} from "react";
import {connect} from "react-redux";
import * as WidgetConfig from "./widgetConfig";
import * as _ from "lodash";
import * as ui from "../ui/elements.ui";
import * as WidgetPlugins from "./widgetPlugins";
import {reset} from "redux-form";


const WidgetsNavItem = (props) => {

    return <li
        className="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger--hover"
        aria-haspopup="true">
        <a href="javascript:void(0);" className="slds-context-bar__label-action" title="Widgets">
            <span className="slds-truncate">Add Widget</span>
        </a>
        <div className="slds-context-bar__icon-action slds-p-left--none" tabindex="0">
            <button className="slds-button slds-button--icon slds-context-bar__button" tabindex="-1">
                <svg aria-hidden="true" className="slds-button__icon">
                    <use xlinkHref="assets/icons/utility-sprite/svg/symbols.svg#chevrondown"></use>
                </svg>
                <span className="slds-assistive-text">Open Add Widget submenu</span>
            </button>
        </div>
        <div className="slds-dropdown slds-dropdown--right">
            <ul className="dropdown__list" role="menu">
                {
                    _.valuesIn(props.widgetPlugins).map(widgetPlugin => {
                        return <ui.DropdownItem key={widgetPlugin.id}
                                                text={widgetPlugin.typeInfo.name}
                                                icon="add"
                                                onClick={() => props.createWidget(widgetPlugin.typeInfo.type)}
                        />
                    })
                }
            </ul>
        </div>
    </li>
};

WidgetsNavItem.propTypes = {
    widgetPlugins: Prop.objectOf(
        Prop.shape({
            id: Prop.string.isRequired,
            typeInfo: Prop.shape({
                type: Prop.string.isRequired,
                name: Prop.string.isRequired,
                settings: Prop.array
            })
        })
    )
};

export default connect(
    (state) => {
        return {
            widgetPlugins: state.widgetPlugins
        }
    },
    (dispatch) => {
        return {
            createWidget: (type) => {
                dispatch(WidgetConfig.createWidget(type))
            }
        }
    }
)(WidgetsNavItem);

