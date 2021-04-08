/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from 'react';

import { AddCircleOutline } from '@material-ui/icons';

import { FormField } from "../../../../../ConfigurationSpec/types";
import { IconBtnWithText } from '../../../Portals/ConfigForm/Elements/Button/IconBtnWithText';
import ExpressionEditor from "../../../Portals/ConfigForm/Elements/ExpressionEditor";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../../Portals/ConfigForm/types";

export interface OperationDropdownProps {
    formFields: FormField[];
    onValidate?: (isRequiredFieldsFilled: boolean) => void;
}

export function SendMessageForm(props: OperationDropdownProps) {
    const { formFields, onValidate } = props;
    const classes = useStyles();
    const [ expandCc, setExpandCc ] = useState(false);
    const [ expandBcc, setExpandBcc ] = useState(false);

    const emptyFieldChecker: Map<string, boolean> = new Map<string, boolean>();
    const validateField = (field: string, isInvalid: boolean): void => {
        emptyFieldChecker.set(field, isInvalid);
        let allFieldsValid = true;
        for (const recordField of formFields[1].fields) {
            const isFieldValueInValid: boolean = emptyFieldChecker.get(recordField.name);
            // breaks the loop if one field is empty
            if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                allFieldsValid = !isFieldValueInValid;
                break;
            }
        }
        onValidate(allFieldsValid);
    }

    const getFormFieldComponent = (component: string): any => {
        const field = formFields.find(category => category.name === "message")?.fields.find(inputField => inputField.name === component);
        if (!field || field?.hide) {
            return null;
        }
        // generate component
        const elementProps: FormElementProps = {
            model: field,
            index: 1,
            customProps: {
                validate: validateField,
                statemenType: field.type
            }
        };
        if (field.name === "sender") {
            elementProps.customProps = { ...elementProps.customProps, isEmail: true };
            return (
                <ExpressionEditor {...elementProps} />
            );
        } else if (field.name === "recipient") {
            elementProps.customProps = { ...elementProps.customProps, isEmail: true };
            return (
                <div className={classes.emailFormTo}>
                     <ExpressionEditor {...elementProps} />
                </div>
            );
        } else if (field.name === "cc") {
            elementProps.customProps = { ...elementProps.customProps, isEmail: true };
            const onCcClicked = () => {
                setExpandCc(true);
            };
            return expandCc ? (
                <ExpressionEditor {...elementProps} />
            ) : (
                    <IconBtnWithText
                        text={"Add " + field.name}
                        onClick={onCcClicked}
                        icon={<AddCircleOutline />}
                    />
                );
        } else if (field.name === "bcc") {
            elementProps.customProps = { ...elementProps.customProps, isEmail: true };
            const onBccClicked = () => {
                setExpandBcc(true);
            };
            return expandBcc ? (
                <ExpressionEditor {...elementProps} />
            ) : (
                    <IconBtnWithText
                        text={"Add " + field.name}
                        onClick={onBccClicked}
                        icon={<AddCircleOutline />}
                    />
                );
        } else if (field.name === "subject") {
            return (
                <div className={classes.emailFormSubject}>
                    <ExpressionEditor {...elementProps} />
                </div>
            );
        } else if (field.name === "messageBody") {
            elementProps.model = field;
            elementProps.customProps = { ...elementProps.customProps, expandDefault: true }
            const onBodyChange = (body: string) => {
                elementProps.model.value = body;
            };
            return (
                <ExpressionEditor {...elementProps} onChange={onBodyChange} />
            );
        }
    };

    const userIdProp: FormElementProps = {
        model: formFields.find(category => category.name === "userId"),
        index: 1,
        customProps: {
            validate: validateField,
            statementType: formFields.find(category => category.name === "userId").type
        }
    };

    return (
        <div>
            <div className={classes.inputWrapper}>
                <div className={classes.groupedForm}>
                    <ExpressionEditor {...userIdProp} />
                    {getFormFieldComponent('sender')}
                    {getFormFieldComponent('recipient')}
                    {getFormFieldComponent('bcc')}
                    {getFormFieldComponent('cc')}
                    {getFormFieldComponent('subject')}
                    {getFormFieldComponent('messageBody')}
                </div>
            </div>
        </div>
    );
}
