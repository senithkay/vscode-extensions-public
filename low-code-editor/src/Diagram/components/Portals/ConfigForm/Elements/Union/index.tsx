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
import React, { useState } from "react";

import { FormHelperText } from "@material-ui/core";

import { FormField } from "../../../../../../ConfigurationSpec/types";
import { getFormElement } from "../../../utils";
import { useStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { SelectDropdownWithButton } from "../DropDown/SelectDropdownWithButton";
import { transformFormFieldTypeToString } from "../ExpressionEditor/utils";

interface UnionProps {
    validate: (field: string, isInvalid: boolean) => void;
}

export function Union(props: FormElementProps<UnionProps>) {
    const { model, customProps } = props;
    const classes = useStyles();
    const textLabel = model && model.displayName ? model.displayName : model.name;

    const [selectedType, setSelectedType] = useState(model.selectedDataType);

    if (!model.optional && !model.selectedDataType && model.fields && model.fields.length > 1) {
        customProps?.validate(model.name, true);
    }

    const getValues = () => {
        const values: string[] = [];
        if (model.fields) {
            for (const field of model.fields) {
                if (field.type) {
                    if (field.type === "record") {
                        if (field.typeName) {
                            values.push(field.typeName);
                        }
                    } else if ((field.type === "collection")) {
                        if (field.collectionDataType) {
                            values.push(field.collectionDataType);
                        }
                    } else {
                        values.push(transformFormFieldTypeToString(field));
                    }
                }
            }
        }
        return values;
    };

    const getSelectedField = (value: string) => {
        let selectedField: FormField;
        if (model.fields) {
            for (const field of model.fields) {
                let type: string = "";
                if (field.type === "record") {
                    type = field.typeName;
                } else if (field.type === "collection" && field.collectionDataType) {
                    type = field.collectionDataType;
                } else {
                    type = transformFormFieldTypeToString(field);
                }
                if (type === value) {
                    selectedField = field;
                    break;
                }
            }
        }
        return selectedField;
    };

    const emptyFieldChecker: Map<string, boolean> = new Map<string, boolean>();
    const validate = (field: string, isInvalid: boolean) => {
        const name: string = !field ? model.name : field;
        emptyFieldChecker.set(name, isInvalid);
        let allFieldsValid = true;

        for (const formValue of model.fields) {
            if (formValue.type === "record") {
                for (const recordField of formValue.fields) {
                    const isFieldValueInValid: boolean = emptyFieldChecker.get(recordField.name);
                    // breaks the loop if one field is empty
                    if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                        allFieldsValid = !isFieldValueInValid;
                        break;
                    }
                }
            } else {
                const isFieldValueInValid: boolean = emptyFieldChecker.get(!field ? model.name : formValue.name);
                // breaks the loop if one field is empty
                if (isFieldValueInValid !== undefined && isFieldValueInValid) {
                    allFieldsValid = !isFieldValueInValid;
                    break;
                }
            }
        }

        customProps?.validate(model.name, !allFieldsValid);
    }

    const fieldModel: FormField = model && model.fields?.length === 1
        ? getSelectedField(getValues()[0])
        : getSelectedField(selectedType);
    let typeField: React.ReactNode = null;
    if (fieldModel) {
        if (fieldModel.type !== "nil") {
            fieldModel.optional = model.optional;
            fieldModel.displayName = "Enter " + textLabel;
            const elementProps: FormElementProps = {
                model: fieldModel,
                customProps: {
                    validate: model.fields && model.fields.length > 1 ? validate : customProps?.validate,
                    statementType: fieldModel.type
                }
            }
            typeField = getFormElement(elementProps, transformFormFieldTypeToString(fieldModel));
        }
    }

    const onSelectConn = (value: string) => {
        model.selectedDataType = value;
        setSelectedType(model.selectedDataType);
        if (value === "nil") {
            customProps?.validate(model.name, false);
        }
    };

    // tslint:disable: jsx-no-multiline-js
    const selector = model && model.fields && model.fields.length > 1 && (
        <SelectDropdownWithButton
            onChange={onSelectConn}
            customProps={{
                values: getValues(),
                disableCreateNew: true,
                className: "unionDropdown"
            }}
            defaultValue={selectedType ? selectedType : ""}
            placeholder="Select Type"
        />
    );

    return (
        <div className={classes.groupedForm}>
            {model && model.optional ?
                (
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>{textLabel}</FormHelperText>
                        <FormHelperText className={classes.optionalLabel}>Optional</FormHelperText>
                    </div>
                ) : (
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>{textLabel}</FormHelperText>
                        <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                    </div>
                )
            }
            {selector}
            {typeField}
        </div>
    );
}
