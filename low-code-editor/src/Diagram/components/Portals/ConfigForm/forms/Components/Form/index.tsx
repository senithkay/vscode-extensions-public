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

const isAllOptionalFields = (recordFields: FormField[]): boolean => recordFields?.every(field => field.optional || field.defaultValue || (field.fields && isAllOptionalFields(field.fields)));

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

    const validateField = (field: string, isInvalid: boolean, isEmpty: boolean): void => {
        validFieldChecker.current.set(field, !isInvalid);
        emptyFieldChecker.current.set(field, isEmpty);
        onValidate(isAllValid(validFieldChecker.current, emptyFieldChecker.current, false, true, true));
    };

    fields?.map((field, index) => {
        if (!field.hide && (field.typeName === "string" || (field.typeName === 'record' && !field.isReference) || field.typeName === "int"
            || field.typeName === "boolean" || field.typeName === "float" || field.typeName === "decimal" || field.typeName === "array"
            || field.typeName === "map" || field.typeName === "union" || field.typeName === "json" ||
            field.typeName === "httpRequest" || field.typeName === "handle")) {
            const elementProps: FormElementProps = {
                model: field,
                index,
                customProps: {
                    validate: validateField,
                    tooltipTitle: field.tooltip
                },
            };

            let type = field.typeName;
            // validate union types
            // only union record types will get Union element
            // other union types will get expression editor
            if (field.typeName === "union"){
                field.members?.forEach((subField: FormField) => {
                    if (subField.typeName !== "record"){
                        type = "expression";
                    }
                });
            } else if (field.isRestParam) {
                type = "restParam"
            } else if (field.typeName === "handle"){
                type = "expression";
            }
            const element = getFormElement(elementProps, type);

            if (element) {
                (field?.optional || field?.defaultValue) ? optionalElements.push(element) : elements.push(element);
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
