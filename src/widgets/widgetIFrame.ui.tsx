/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import {connect} from 'react-redux'
import * as WidgetConfig from './widgetConfig'
import * as WidgetPlugins from './widgetPlugins'
import {deleteWidget, IWidgetState} from './widgets'
import * as Widgets from './widgets'
import {PropTypes as Prop}  from "react";
import Dashboard from '../dashboard'

interface WidgetIFrameProps {
    widget: IWidgetState
}

/**
 * The Dragable Frame of a Widget.
 * Contains generic UI controls, shared by all Widgets
 */
class WidgetIFrame extends React.Component<WidgetIFrameProps, void> {

    constructor(props) {
        super(props)
    }

    render() {
        return <iframe src="widget.html">

        </iframe>
    };
}
export default WidgetIFrame;
