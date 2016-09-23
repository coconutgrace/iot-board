/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import {connect} from 'react-redux'
import * as Modal from './modalDialog'
import * as ui from '../ui/elements.ui.js'
import {PropTypes as Prop}  from "react";


class ModalDialog extends React.Component {

    constructor(props) {
        super(props)
        this.state = {screen: this.screenSize()}
    }

    componentDidMount() {
        const $modal = $('.ui.modal.' + this.props.id);
        $modal.modal({
            detachable: false,
            closable: false,
            observeChanges: true,
            onApprove: ($element) => false,
            onDeny: ($element) => false,
            transition: "fade",
            onVisible: () => {
                // This is to update the Browser Scrollbar, at least needed in WebKit
                if (typeof document !== 'undefined') {
                    const n = document.createTextNode(' ');
                    $modal.append(n);
                    setTimeout(function () {
                        n.parentNode.removeChild(n)
                    }, 0);
                }
            }
        })

        $(window).resize(() => {
            this.setState({screen: this.screenSize()})
        })
    }

    screenSize() {
        if (typeof window === 'undefined') {
            console.log("Running on nodeJS!")
            return {
                height: 500,
                width: 500
            }
        }
        return {
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
            width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
        }
    }

    onClick(e, action) {
        if (action.onClick(e)) {
            // Closing is done externally (by redux)
            this.props.closeDialog();
            //ModalDialog.closeModal(this.props.id);
        }
    }


    render() {
        let key = 0;
        const actions = this.props.actions.map(action => {
            return <div key={key++} className={action.className} onClick={(e) => this.onClick(e, action)}>
                {action.label}
                {action.iconClass ? <i className={action.iconClass}/> : null}
            </div>
        });

        const props = this.props;
        // TODO: realize Modals with React, then isOpen gets handy:
        //const isOpen = props.dialogState.dialogId == props.id && props.dialogState.isVisible;

        const height = this.state.screen.height;
        const width = this.state.screen.width;

        return <div id={this.props.id}
                    className={'ui modal ' + this.props.id} style={{width: width - 80, top: 40, left: 40, margin: 1}}>
            <div className="header">
                {props.title}
            </div>
            <div className="content" style={{overflowY: 'scroll', height: height - 300}}>
                {props.children}
            </div>
            <div className="actions">
                {actions}
            </div>
        </div>
    }
}

ModalDialog.propTypes = {
    children: React.PropTypes.element.isRequired,
    title: Prop.string.isRequired,
    id: Prop.string.isRequired,
    actions: Prop.arrayOf(
        Prop.shape({
            className: Prop.string.isRequired,
            iconClass: Prop.string,
            label: Prop.string.isRequired,
            onClick: Prop.func.isRequired
        })
    ).isRequired,
    handlePositive: Prop.func,
    handleDeny: Prop.func,
    closeDialog: Prop.func
};

export default connect(
    (state) => {
        return {
            dialogState: state.modalDialog
        }
    },
    (dispatch) => {
        return {
            closeDialog: () => dispatch(Modal.closeModal())
        }
    }
)(ModalDialog)
