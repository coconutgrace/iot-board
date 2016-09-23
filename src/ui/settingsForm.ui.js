/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import {connect} from 'react-redux'
import * as ui from './elements.ui'
import {Field, reduxForm, reset} from 'redux-form';
import {chunk} from '../util/collection'
import * as _ from 'lodash'
import {PropTypes as Prop}  from "react";

class SettingsForm extends React.Component {

    componentDidMount() {
        this._initSemanticUi();
    }

    componentDidUpdate() {
        this._initSemanticUi();
    }

    _initSemanticUi() {
        $('.icon.help.circle')
            .popup({
                position: "top left",
                offset: -10
            });
        $('.ui.checkbox')
            .checkbox();
    }

    render() {
        const props = this.props;
        return <form className="ui form">
            {/*className="two fields" with chunk size of 2*/}
            {
                chunk(this.props.settings, 1).map(chunk => {
                    return <div key={chunk[0].id} className="field">
                        {chunk.map(setting => {
                            return <LabeledField key={setting.id} setting={setting}/>;
                        })}
                    </div>
                })
            }

        </form>
    }
}

SettingsForm.propTypes = {
    initialValues: Prop.object.isRequired,
    settings: Prop.arrayOf(Prop.shape({
            id: Prop.string.isRequired
        },
    )).isRequired
};

export default reduxForm({enableReinitialize: "true"})(SettingsForm);


function LabeledField(props) {
    const setting = props.setting;
    return <div className="field">
        <label>{setting.name}
            {setting.description && setting.type !== 'boolean' ?
                <ui.Icon type="help circle" data-content={setting.description}/> : null}
        </label>
        <SettingsInput setting={props.setting}/>
    </div>
}

LabeledField.propTypes = {
    setting: Prop.shape({
        id: Prop.string.isRequired,
        type: Prop.string.isRequired,
        name: Prop.string.isRequired,
        description: Prop.string
    }).isRequired
};

function SettingsInput(props) {
    const setting = props.setting;
    switch (setting.type) {
        case "text":
            return <Field name={setting.id} component="textarea" rows="3" placeholder={setting.description}/>;
        case "string":
            return <Field name={setting.id} component="input" type="text" placeholder={setting.description}/>;
        case "json": // TODO: Offer better editor + validation
            return <Field name={setting.id} component="textarea" rows="3" placeholder={setting.description}/>;
        case "number": // TODO: Validate numbers, distinct between integers and decimals?
            return <Field name={setting.id} component="input" type="number" min={setting.min} max={setting.max}
                          placeholder={setting.description}/>;
        case "boolean":
            return <Field name={setting.id} component="input" type="checkbox"/>;
        case "option":
            return <Field name={setting.id} component="select" className="ui fluid dropdown">
                <option>{"Select " + props.name + " ..."}</option>
                {setting.options.map(option => {
                    const optionValue = _.isObject(option) ? option.value : option;
                    const optionName = _.isObject(option) ? option.name : option;
                    return <option key={optionValue} value={optionValue}>{optionName}</option>
                })}
            </Field>;
        case "datasource":
            return <DatasourceInputContainer setting={setting}/>
        default:
            console.error("Unknown type for settings field with id '" + setting.id + "': " + setting.type);
            return <input placeholder={setting.description} readonly value={"Unknown field type: " + setting.type}/>;
    }
}


SettingsInput.propTypes = {
    setting: Prop.shape({
        type: Prop.string.isRequired,
        id: Prop.string.isRequired,
        name: Prop.string.isRequired,
        description: Prop.string,
        defaultValue: Prop.any,
        min: Prop.number, // for number
        max: Prop.number, // for number
        options: Prop.oneOfType([
                Prop.arrayOf( // For option
                    Prop.shape({
                            name: Prop.string,
                            value: Prop.string.isRequired
                        }.isRequired
                    )).isRequired,
                Prop.arrayOf(Prop.string).isRequired
            ]
        )
    }).isRequired

};

const DatasourceInput = (props) => {
    const datasources = props.datasources;
    const setting = props.setting;

    return <Field name={setting.id} component="select"  className="ui fluid dropdown">
        <option>{"Select " + setting.name + " ..."}</option>
        {_.toPairs(datasources).map(([id, ds]) => {
            return <option key={id} value={id}>{ds.settings.name + " (" + ds.type + ")"}</option>
        })}
    </Field>;
};

DatasourceInput.propTypes = {
    datasources: Prop.object.isRequired,
    setting: Prop.shape({
        id: Prop.string.isRequired,
        type: Prop.string.isRequired,
        name: Prop.string.isRequired
    }).isRequired
};


const DatasourceInputContainer = connect(
    (state) => {
        return {
            datasources: state.datasources
        }
    }
)(DatasourceInput);
