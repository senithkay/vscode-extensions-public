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

import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { getFormElement } from "../../Portals/utils";
import FormAccordion from "../FormAccordion";
import { ExpressionInjectablesProps } from "../FormGenerator";
import { FormElementProps, FormFieldChecks } from "../Types";
import { isAllFieldsValid } from "../Utils";

import { useStyles } from "./styles";

export interface FormProps {
    fields: FormField[];
    onValidate?: (isRequiredFieldsFilled: boolean) => void;
    size?: "small" | "medium",
    expressionInjectables?: ExpressionInjectablesProps;
}

const isAllOptionalFields = (recordFields: FormField[]): boolean => recordFields?.every(field => field.optional || field.defaultValue || (field.fields && isAllOptionalFields(field.fields)));

export function Form(props: FormProps) {
    const { fields, onValidate, expressionInjectables } = props;

    const classes = useStyles();
    const elements: ReactNode[] = [];
    const optionalElements: ReactNode[] = [];
    const allFieldChecks = React.useRef(new Map<string, FormFieldChecks>());

    React.useEffect(() => {
        // Set form as valid if there aren't any mandatory fields
        if (fields && isAllOptionalFields(fields)){
            onValidate(true);
        }
    }, []);

    const validateField = (field: string, isInvalid: boolean, isEmpty: boolean, canIgnore?: boolean) => {
        allFieldChecks.current.set(field, {
            name: field,
            isValid: !isInvalid,
            isEmpty,
            canIgnore,
        });
        onValidate(isAllFieldsValid(allFieldChecks.current, fields, true));
    };

    const fieldTypesList = ["string" , "int" , "boolean" , "float" , "decimal" , "array" , "map" , "union", "xml",
    "json" , "httpRequest" , "handle" , "object {public string[] & readonly strings;public Value[] insertions;}"]
    fields?.map((field, index) => {
        if (!field.hide && (fieldTypesList.includes(field.typeName) || (field.typeName === 'record' && !field.isReference))) {
            const elementProps: FormElementProps = {
                model: field,
                index,
                customProps: {
                    validate: validateField,
                    tooltipTitle: field.tooltip,
                    expressionInjectables,
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
            } else if (field.typeName === "object {public string[] & readonly strings;public Value[] insertions;}"){
                type = "expression";
            }
            const element = getFormElement(elementProps, type);

            if (element) {
                (field?.optional || field?.defaultable) ? optionalElements.push(element) : elements.push(element);
            }
        }
    });

    return (
        <form className={classes.fullWidth} noValidate={true} autoComplete="off">
            <FormAccordion
                depth={1}
                mandatoryFields={elements}
                optionalFields={optionalElements}
                isMandatory={false}
            />
        </form>
    );
}
