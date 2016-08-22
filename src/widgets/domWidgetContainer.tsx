/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


import * as React from "react";
import {IWidgetPlugin, IWidgetProps} from "./widgetPluginFactory";
import ReactInstance = __React.ReactInstance;


interface IDomWidgetContainerState {
    widget: IWidgetPlugin
}

export class DomWidgetContainer extends React.Component<IWidgetProps, IDomWidgetContainerState> implements IWidgetPlugin {


    constructor(props: IWidgetProps) {
        super(props);

        this.state = {
            widget: new props._widgetClass(props)
        };
    }

    get element() {
        return this.refs['container']
    }

    set element(element: ReactInstance) {
        throw new Error("Can not change element")
    }

    componentWillMount() {
        if (this.state.widget.componentWillMount) {
            this.state.widget.componentWillMount();
        }
    }

    componentDidMount() {
        this.state.widget.element = this.element;
        this.state.widget.render();
        if (this.state.widget.componentDidMount) {
            this.state.widget.componentDidMount();
        }
    }

    componentWillReceiveProps(nextProps: IWidgetProps, nextContext: any) {
        if (this.state.widget.componentWillReceiveProps) {
            this.state.widget.componentWillReceiveProps(nextProps, nextContext);
        }
    }

    shouldComponentUpdate(nextProps: IWidgetProps, nextState: IDomWidgetContainerState, nextContext: any) {
        if (this.state.widget.shouldComponentUpdate) {
            return this.state.widget.shouldComponentUpdate(nextProps, nextState, nextContext);
        }
        return true;
    }

    componentWillUpdate(nextProps: IWidgetProps, nextState: IDomWidgetContainerState, nextContext: any) {
        if (this.state.widget.componentWillUpdate) {
            this.state.widget.componentWillUpdate(nextProps, nextState, nextContext);
        }
    }

    componentDidUpdate(prevProps: IWidgetProps, prevState: IDomWidgetContainerState, prevContext: any) {
        this.state.widget.element = this.element;
        this.state.widget.render();
        if (this.state.widget.componentDidUpdate) {
            this.state.widget.componentDidUpdate(prevProps, prevState, prevContext);
        }
    }


    componentWillUnmount() {
        if (this.state.widget.componentWillUnmount) {
            this.state.widget.componentWillUnmount();
        }
    }

    render() {
        return <div ref="container">Widget Plugin missing rendering!</div>;
    }
}
