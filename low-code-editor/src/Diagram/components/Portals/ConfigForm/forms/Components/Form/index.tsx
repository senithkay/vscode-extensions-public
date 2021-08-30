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
import {isAllValid} from "../../../../../../../utils/validator";
import { useStyles } from "../../../../../ConfigPanel/styles";
import FormAccordion from "../../../../../FormAccordion";
import { getFormElement } from "../../../../utils";
import { FormElementProps } from "../../../types";

export interface FormProps {
    fields: FormField[];
    onValidate?: (isRequiredFieldsFilled: boolean) => void;
    size?: "small" | "medium"
}

const isAllOptionalFields = (recordFields: FormField[]): boolean => recordFields.every(field => field.optional || (field.fields && isAllOptionalFields(field.fields)))

export function Form(props: FormProps) {
    const { fields, onValidate } = props;

    const classes = useStyles();
    const elements: ReactNode[] = [];
    const optionalElements: ReactNode[] = [];
    const validFieldChecker = React.useRef(new Map<string, boolean>());
    const emptyFieldChecker = React.useRef(new Map<string, boolean>());

    React.useEffect(() => {
        // Set form as valid if there aren't any mandatory fields
        if (isAllOptionalFields(fields)){
            onValidate(true);
        }
    }, [])

    const validateField = (field: string, isValid: boolean, isEmpty: boolean): void => {
        validFieldChecker.current.set(field, isValid);
        emptyFieldChecker.current.set(field, isEmpty);
        onValidate(isAllValid(validFieldChecker.current, emptyFieldChecker.current, false, true));
    };

    fields.map((field, index) => {
        if (!field.hide && (field.type === "string" || (field.type === 'record' && !field.isReference) || field.type === "int"
            || field.type === "boolean" || field.type === "float" || field.type === "collection"
            || field.type === "map" || field.type === "union" || field.type === "json" ||
            field.type === "httpRequest" || field.type === "handle")) {
            const elementProps: FormElementProps = {
                model: field,
                index,
                customProps: {
                    validate: validateField,
                    tooltipTitle: field.tooltip
                },
            };

            let type = field.type;
            // validate union types
            // only union record types will get Union element
            // other union types will get expression editor
            if (field.type === "union"){
                field.fields?.forEach((subField: FormField) => {
                    if (subField.type !== "record"){
                        type = "expression";
                    }
                });
            } else if (field.isRestParam) {
                type = "restParam"
            } else if (field.type === "handle"){
                type = "expression";
            }
            const element = getFormElement(elementProps, type);

            if (element) {
                field?.optional ? optionalElements.push(element) : elements.push(element);
            }
        }
    });

    return (
        <form className={classes.inputUrl} noValidate={true} autoComplete="off">
            <FormAccordion
                depth={1}
                mandatoryFields={elements}
                optionalFields={optionalElements}
                isMandatory={false}
            />
        </form>
    );
}
