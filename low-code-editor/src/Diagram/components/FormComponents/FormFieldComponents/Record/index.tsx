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
import React from "react";

import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { getFormElement } from "../../../Portals/utils";
import { useStyles } from "../../DynamicConnectorForm/style";
import FormAccordion from "../../FormAccordion";
import { ExpressionInjectablesProps } from "../../FormGenerator";
import { FormElementProps, FormFieldChecks } from "../../Types";
import { isAllEmpty, isAllFieldsValid } from "../../Utils";

interface RecordProps {
    validate?: (field: string, isInvalid: boolean, isEmpty: boolean, canIgnore?: boolean) => void;
    expressionInjectables?: ExpressionInjectablesProps;
    editPosition?: NodePosition;
}

export function Record(props: FormElementProps<RecordProps>) {
    const { model, customProps } = props;
    const { validate, expressionInjectables, editPosition } = customProps;
    const classes = useStyles();
    const allFieldChecks = React.useRef(new Map<string, FormFieldChecks>());

    const recordFields: React.ReactNode[] = [];
    const optionalRecordFields: React.ReactNode[] = [];

    const validateField = (field: string, isInvalid: boolean, isEmpty: boolean, canIgnore?: boolean) => {
        allFieldChecks.current.set(field, {
            name: field,
            isValid: !isInvalid,
            isEmpty,
            canIgnore,
        });
        validate(
            model.name,
            !isAllFieldsValid(allFieldChecks.current, model, false),
            isAllEmpty(allFieldChecks.current),
            (model.optional || model.defaultable)
        );
    };

    const fieldTypesList = ["string" , "int" , "boolean" , "float" , "decimal" , "array" , "map" , "union" , "enum", "handle"];
    if (model) {
        if (model.fields && model.fields.length > 0) {
            model.fields.map((field: FormField, index: any) => {
                if (!field.hide && (fieldTypesList.includes(field.typeName) || field.typeName.includes("object {public string[]") || (field.typeName === 'record' && !field.isReference))) {
                    const elementProps: FormElementProps = {
                        model: field,
                        index,
                        customProps: {
                            validate: validateField,
                            expressionInjectables,
                            editPosition,
                        }
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
                    }
                    if (field.typeName === "handle"){
                        type = "expression";
                    } else if (field.typeName.includes("object {public string[]")){
                        type = "expression";
                    }
                    const element = getFormElement(elementProps, type);

                    if (element) {
                        (field?.optional || field?.defaultable) ? optionalRecordFields.push(element) : recordFields.push(element);
                    }
                }
            });
        }
    }

    return (
        <div className={classes.marginTB}>
            <FormAccordion
                title={model.label || model.name}
                depth={2}
                mandatoryFields={recordFields}
                optionalFields={optionalRecordFields}
                isMandatory={!(model.optional ?? false)}
            />
        </div>
    );
}
