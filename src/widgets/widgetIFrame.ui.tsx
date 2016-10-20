/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from "react";
import {IWidgetPluginState} from "./widgetPlugins";
import {IWidgetState} from "../pluginApi/pluginTypes";
import Dashboard from "../dashboard";

interface IWidgetIFrameProps {
    widgetState: IWidgetState
    widgetPluginState: IWidgetPluginState
}

/**
 * The Dragable Frame of a Widget.
 * Contains generic UI controls, shared by all Widgets
 */
export default class WidgetIFrame extends React.Component<IWidgetIFrameProps, void> {

    constructor(props: IWidgetIFrameProps) {
        super(props)
    }

    componentDidMount() {
        const element: HTMLIFrameElement = this.refs['frame'] as HTMLIFrameElement;

        const widgetFactory = Dashboard.getInstance().widgetPluginRegistry.getPlugin(this.props.widgetState.type);
        const widgetInstance = widgetFactory.getInstance(this.props.widgetState.id)
        widgetInstance.iFrame = element;
    }


    // allow-popups allow-same-origin allow-modals allow-forms
    // A sandbox that includes both the allow-same-origin and allow-scripts flags,
    // then the framed page can reach up into the parent, and remove the sandbox attribute entirely.
    // Only if the framed content comes from the same origin of course.

    render() {
        return <iframe id={'frame-' + this.props.widgetState.id} ref="frame" src={"widget.html#" + this.props.widgetPluginState.url} frameBorder="0" width="100%" height="100%"
                       scrolling="no"
                       sandbox="allow-scripts">
            Browser does not support iFrames.
        </iframe>
    };
}
