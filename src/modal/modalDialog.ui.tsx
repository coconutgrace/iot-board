/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import {connect} from 'react-redux'
import * as Modal from './modalDialog.js'
import * as AppState from '../appState'

export interface IModalDialogState {
    dialogId: string
    data: any
    isVisible: boolean
    errors: string[]
}

interface DialogAction {
    className: string
    iconClass: string
    label: string
    onClick: Function
}

interface ModalDialogProps {
    children: any
    title: string
    id: string
    dialogState: IModalDialogState
    actions: DialogAction[]
    handlePositive: () => void
    handleDeny: () => void
    closeDialog: () => void
}


class ModalDialog extends React.Component<ModalDialogProps, any> {

    constructor(props: ModalDialogProps) {
        super(props)
        this.state = {screen: this.screenSize()}
    }

    componentDidMount() {
        const $modal: any = $('.ui.modal.' + this.props.id);
        $modal.modal({
            detachable: false,
            closable: false,
            observeChanges: true,
            onApprove: ($element: any) => false,
            onDeny: ($element: any) => false,
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

    onClick(e: React.MouseEvent, action: DialogAction) {
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
                    className={'ui modal ' + this.props.id} style={{width: width - 80, top: 40, left: 40, margin: 1, minHeight:"500px"}}>
            <div className="header">
                {props.title}
            </div>
            <div className="content" style={{overflowY: 'scroll', height: height - 300, minHeight:"500px"}}>
                {this.props.dialogState.errors ?
                    this.props.dialogState.errors.map((message, i) => {
                        return <ModalErrorComponent key={i} errorMessage={message}/>
                    })
                    : null}
                {props.children}
            </div>
            <div className="actions">
                {actions}
            </div>
        </div>
    }
}

export default connect(
    (state: AppState.State, ownProps: any) => {
        return {
            dialogState: state.modalDialog
        }
    },
    (dispatch: AppState.Dispatch) => {
        return {
            closeDialog: () => dispatch(Modal.closeModal())
        }
    }
)(ModalDialog)

interface ModalErrorProps {
    errorMessage: string
    close: (message: string) => void
}

class ModalError extends React.Component<ModalErrorProps, any> {
    close() {
        this.props.close(this.props.errorMessage)
    }

    render() {
        return <div className="slds-notify_container slds-is-relative slds-m-bottom--x-small">
            <div className="slds-notify slds-notify--alert slds-theme--error slds-theme--alert-texture" role="alert">
                <button className="slds-button slds-notify__close slds-button--icon-inverse"
                        onClick={() => this.close()}
                >
                    <svg aria-hidden="true" className="slds-button__icon">
                        <use xlinkHref="/assets/icons/utility-sprite/svg/symbols.svg#close"></use>
                    </svg>
                    <span className="slds-assistive-text">Close</span>
                </button>
                <span className="slds-assistive-text">Error</span>
                <h2>{this.props.errorMessage}</h2>
            </div>
        </div>
    }
}

const ModalErrorComponent = connect(
    (state: AppState.State, ownProps: any) => {
        return {
            errorMessage: ownProps.errorMessage
        }
    },
    (dispatch: AppState.Dispatch) => {
        return {
            close: (message: string) => {
                dispatch(Modal.deleteError(message))
            }
        }
    }
)(ModalError)
