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
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";

import { FormField } from "../../../../../../ConfigurationSpec/types";
import { Form } from "../../forms/Components/Form";
import { useStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { SelectDropdownWithButton } from "../DropDown/SelectDropdownWithButton";

interface UnionProps {
    validate: (field: string, isInvalid: boolean) => void;
}

export function Union(props: FormElementProps<UnionProps>) {
    const { model, customProps } = props;
    const classes = useStyles();
    const textLabel = model && model.displayName ? model.displayName : model.name;

    const [ selectedType, setSelectedType ] = useState(model.selectedDataType);

    useEffect(() => {
        if (!selectedType) {
            const types = getTypes();
            if (types && types.length > 0) {
                setSelectedType(types[ 0 ]);
            }
        }
    }, [ selectedType ]);



    const getTypes = () => {
        const types: string[] = [];
        model.members?.forEach((field: FormField, key: number) => {
            const name = getUnionFormFieldName(field);
            if (name) {
                types.push(name);
            }
        });

        return types;
    };

    const getSelectedFormField = () => {
        const selectedField: FormField = model.members?.find((field: FormField) => {
            const name = getUnionFormFieldName(field);
            return name === selectedType;
        });

        return selectedField;
    };

    const getElement = () => {
        let element: React.ReactNode = null;
        const selectedField = getSelectedFormField();
        model.selectedDataType = selectedType;
        if (selectedField && selectedField.typeName) {
            element = (
                <div className={classes.removeInnerMargin}>
                    <Form fields={selectedField.fields} onValidate={validateForm} key={selectedType} />
                </div>
            );
        }

        return element;
    };

    const validateForm = (isValid: boolean) => {
        customProps?.validate(model.name, !isValid);
    };

    const handleTypeChange = (value: string) => {
        model.selectedDataType = value;
        setSelectedType(value);
        if (value === "nil") {
            customProps?.validate(model.name, false);
        }
    };

    const selector = model && model.fields && model.fields.length > 1 && (
        <SelectDropdownWithButton
            onChange={handleTypeChange}
            customProps={ {
                values: getTypes(),
                disableCreateNew: true,
                className: "unionDropdown"
            } }
            defaultValue={selectedType ? selectedType : ""}
            placeholder="Select Type"
        />
    );

    return (
        <div className={classes.groupedFormUnion}>
            {model && model.optional ?
                (
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>{textLabel}</FormHelperText>
                        <FormHelperText className={classes.optionalLabel}><FormattedMessage id="lowcode.develop.elements.union.optional.label" defaultMessage="Optional" /></FormHelperText>
                    </div>
                ) : (
                    <div className={classes.labelWrapper}>
                        <FormHelperText className={classes.inputLabelForRequired}>{textLabel}</FormHelperText>
                        <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                    </div>
                )
            }
            {selector}
            {getElement()}
        </div>
    );
}

// get field name of the union record
export function getUnionFormFieldName(field: FormField): string {
    let name = field.label;
    if (!name) {
        name = field.name;
    }
    if (!name) {
        name = field.typeInfo?.name;
    }
    if (!name) {
        name = field.typeName;
    }

    return name;
}
