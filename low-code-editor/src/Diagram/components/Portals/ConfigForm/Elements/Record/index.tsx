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

import { FormHelperText } from "@material-ui/core";

import { getFormElement } from "../../../utils";
import { useStyles } from "../../forms/style";
import { FormElementProps } from "../../types";

interface RecordProps {
    validate?: (field: string, isInvalid: boolean) => void;
}

export function Record(props: FormElementProps<RecordProps>) {
    const { model, customProps } = props;
    const classes = useStyles();

    const recordFields: React.ReactNode[] = [];
    let fieldNecessity: string = "";

    if (model) {
        fieldNecessity = model.optional ? "(Optional)" : "*";
        if (model.fields && model.fields.length > 0) {
            model.fields.map((field: any, index: any) => {
                if (!field.hide && (field.type === "string" || field.type === "int" || field.type === "boolean"
                    || field.type === "float" || field.type === "collection" || (field.type === 'record' && !field.isReference) ||
                    (field.type === "union" && !field.optional))) {
                    field.optional = model.optional ? model.optional : field.optional;
                    const elementProps: FormElementProps = {
                        model: field,
                        index,
                        customProps: {
                            validate: customProps.validate,
                            statementType: field.type
                        }
                    }
                    const element = getFormElement(elementProps, field.type);
                    if (element) {
                        recordFields.push(element);
                    }
                }
            });
        }
    }

    const modelName = model && model.displayName ? model.displayName : model.name;
    const fieldName = modelName ? modelName + " " + fieldNecessity : "";

    return (
        <div className={classes.marginTB}>
            {model && model.optional ?
                (
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>{modelName}</FormHelperText>
                        <FormHelperText className={classes.optionalLabel}>Optional</FormHelperText>
                    </div>
                ) : (
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>{modelName}</FormHelperText>
                        <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                    </div>
                )
            }
            <div className={classes.groupedForm}>
                {...recordFields}
            </div >
        </div>
    );
}
