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
import React, { ReactNode } from "react";

import { FormField } from "../../../../../../../ConfigurationSpec/types";
import { useStyles } from "../../../../../ConfigPanel/styles";
import { getFormElement } from "../../../../utils";
import { FormElementProps } from "../../../types";

export interface FormProps {
    fields: FormField[];
    onValidate?: (isRequiredFieldsFilled: boolean) => void;
    size?: "small" | "medium"
}

export function Form(props: FormProps) {
    const { fields, onValidate } = props;

    const classes = useStyles();
    const elements: ReactNode[] = [];

    const emptyFieldChecker: Map<string, boolean> = new Map<string, boolean>();

    const validateField = (field: string, isInvalid: boolean): void => {
        emptyFieldChecker.set(field, isInvalid);
        let allFieldsValid = true;

        for (const formValue of fields) {
            if (formValue.type === "record") {
                for (const recordField of formValue.fields) {
                    const isFieldValueInValid: boolean = emptyFieldChecker.get(recordField.name);
                    // breaks the loop if one field is empty
                    if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                        allFieldsValid = !isFieldValueInValid;
                        break;
                    }
                }
            } else if (formValue.type === "union") {
                for (const unionField of formValue.fields) {
                    if (unionField.type === "record") {
                        for (const recordField of unionField.fields) {
                            const isFieldValueInValid: boolean = emptyFieldChecker.get(recordField.name);
                            // breaks the loop if one field is empty
                            if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                                allFieldsValid = !isFieldValueInValid;
                                break;
                            }
                        }
                    } else {
                        const isFieldValueInValid: boolean = emptyFieldChecker.get(formValue.name);
                        // breaks the loop if one field is empty
                        if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                            allFieldsValid = !isFieldValueInValid;
                            break;
                        }
                    }
                }
                if (!allFieldsValid) {
                    break;
                }
            } else {
                const isFieldValueInValid: boolean = emptyFieldChecker.get(formValue.name);
                // breaks the loop if one field is empty
                if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                    allFieldsValid = !isFieldValueInValid;
                    break;
                }
            }
        }
        onValidate(allFieldsValid);
    };

    fields.map((field, index) => {
        if (!field.hide && (field.type === "string" || field.type === "record" || field.type === "int"
            || field.type === "boolean" || field.type === "float" || field.type === "collection"
            || field.type === "union")) {
            const elementProps: FormElementProps = {
                model: field,
                index,
                customProps: {
                    validate: validateField,
                    tooltipTitle: field.tooltip,
                    statementType: field.type
                },
            };
            const element = getFormElement(elementProps, field.type);
            if (element) {
                elements.push(element);
            }
        }
    });

    return (
        <form className={classes.inputUrl} noValidate={true} autoComplete="off">
            {...elements}
        </form>
    );
}
