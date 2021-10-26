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

import { FormField } from "../../../../../ConfigurationSpec/types";
import {isAllEmpty, isAllOptional, isAllValid} from "../../../../../utils/validator";
import FormAccordion from "../../FormAccordion";
import { getFormElement } from "../../../Portals/utils";
import { useStyles } from "../../../Portals/ConfigForm/forms/style";
import { FormElementProps } from "../../Types";

interface RecordProps {
    validate?: (field: string, isInvalid: boolean, isEmpty: boolean) => void;
}

export function Record(props: FormElementProps<RecordProps>) {
    const { model, customProps } = props;
    const { validate } = customProps;
    const classes = useStyles();
    const validFieldChecker = React.useRef(new Map<string, boolean>());
    const emptyFieldChecker = React.useRef(new Map<string, boolean>());

    const recordFields: React.ReactNode[] = [];
    const optionalRecordFields: React.ReactNode[] = [];


    const validateField = (field: string, isInvalid: boolean, isEmpty: boolean): void => {
        validFieldChecker.current.set(field, !isInvalid);
        emptyFieldChecker.current.set(field, isEmpty);
        validate(model.name, !isAllValid(validFieldChecker.current, emptyFieldChecker.current,
                isAllOptional(model.fields), (model.optional ?? false), false), isAllEmpty(emptyFieldChecker.current));
    };

    if (model) {
        if (model.fields && model.fields.length > 0) {
            model.fields.map((field: FormField, index: any) => {
                if (!field.hide && (field.typeName === "string" || field.typeName === "int" || field.typeName === "boolean" || field.typeName === "float" ||
                    field.typeName === "decimal" || field.typeName === "array" || (field.typeName === 'record' && !field.isReference) ||
                    field.typeName === "union" || field.typeName === "map" || field.typeName === "handle")) {
                    const elementProps: FormElementProps = {
                        model: field,
                        index,
                        customProps: {
                            validate: validateField
                        }
                    };

                    let type = field.typeName;
                    // validate union types
                    // only union record types will get Union element
                    // other union types will get expression editor
                    if (field.typeName === "union"){
                        field.fields?.forEach((subField: FormField) => {
                            if (subField.typeName !== "record"){
                                type = "expression";
                            }
                        });
                    }
                    if (field.typeName === "handle"){
                        type = "expression";
                    }
                    const element = getFormElement(elementProps, type);

                    if (element) {
                        (field?.optional || field?.defaultValue) ? optionalRecordFields.push(element) : recordFields.push(element);
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
