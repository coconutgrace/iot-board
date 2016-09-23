/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import {PropTypes as Prop}  from "react";

/**
 * This module contains generic UI Elements reuse in the app
 */

export const DropdownItem = (props) => {
    let icon;
    let iconRight;
    if (props.icon) {
        icon = <svg aria-hidden="true"
                    className={"slds-icon slds-icon--x-small slds-icon-text-default slds-m-right--x-small" + (props.isCheckbox ? " slds-icon--selected" : "")}>
            <use xlinkHref={"/assets/icons/utility-sprite/svg/symbols.svg#" + props.icon}></use>
        </svg>;
    }
    if (props.iconRight) {
        iconRight = <svg aria-hidden="true"
                         className="slds-icon slds-icon--x-small slds-icon-text-default slds-m-left--small slds-shrink-none"
                         onClick={(e) => {
                             if (props.iconRightClick) {
                                 e.stopPropagation();
                                 e.preventDefault();
                                 props.iconRightClick(e);
                             }
                         }}
        >
            <use xlinkHref={"/assets/icons/utility-sprite/svg/symbols.svg#" + props.iconRight}></use>
        </svg>;
    }

    return <li className={"slds-dropdown__item" + (props.selected ? " slds-is-selected" : "")} role="presentation">
        <a href="javascript:void(0);" role={props.isCheckbox ? "menuitemcheckbox" : "menuitem"}
           aria-checked={props.selected ? "true" : "false"}
           onClick={(e) => {
               e.stopPropagation();
               e.preventDefault();
               props.onClick(e);
           }}
           tabindex="-1">
            <span className="slds-truncate">{icon} {props.text}</span>{iconRight}
        </a>
    </li>
};

DropdownItem.propTypes = {
    onClick: Prop.func.isRequired,
    iconRightClick: Prop.func,
    text: Prop.string,
    icon: Prop.string,
    iconRight: Prop.string,
    isCheckbox: Prop.string,
    children: Prop.any,
    selected: Prop.bool
};

export const LinkItem = (props) => {
    let icon;
    if (props.icon) {
        icon = <i className={props.icon +" icon"}/>;
    }

    return <a className={"item" + (props.disabled ? " disabled" : "")} href="#"
              onClick={(e) =>{
              e.stopPropagation();
              e.preventDefault();
              props.onClick(props);
              }}>{icon} {props.children} {props.text}</a>;
};

LinkItem.propTypes = {
    onClick: Prop.func.isRequired,
    text: Prop.string,
    icon: Prop.string,
    disabled: Prop.bool,
    children: Prop.any
};

export const Icon = (props) => {
    const classes = [];
    classes.push(props.type);
    if (props.align === 'right') {
        classes.push('right floated');
    }
    if (props.size !== "normal") {
        classes.push(props.size);
    }
    classes.push('icon');
    return <i {...props} className={classes.join(" ")}/>
};

Icon.propTypes = {
    type: Prop.string.isRequired,
    onClick: Prop.func,
    align: Prop.oneOf(["left", "right"]),
    size: Prop.oneOf(["mini", "tiny", "small", "normal", "large", "huge", "massive"])
};


export const Divider = (props) => {
    return <div className="ui divider"></div>
};
