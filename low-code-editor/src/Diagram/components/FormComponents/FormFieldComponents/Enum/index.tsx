/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStyles } from "../../DynamicConnectorForm/style";
import { FormElementProps } from "../../Types";
import { SelectDropdownWithButton } from "../DropDown/SelectDropdownWithButton";

interface EnumProps {
    validate: (field: string, isInvalid: boolean) => void;
}

export function Enum(props: FormElementProps<EnumProps>) {
    const { model, customProps } = props;
    const classes = useStyles();
    const textLabel = model.displayAnnotation?.label || model.name;

    const [selectedType, setSelectedType] = useState(model.value?.replaceAll('\"', "") || "");

    useEffect(() => {
        if (!model.optional && !selectedType) {
            const types = getTypes();
            if (types && types.length > 0) {
                setSelectedType(model.defaultValue || types[0]);
            }
        }
    }, [selectedType]);

    const getTypes = () => {
        const types: string[] = [];
        model.members?.forEach((field: FormField) => {
            if (field.typeName) {
                types.push(field.typeName);
            }
        });

        return types;
    };

    const handleTypeChange = (value: string) => {
        model.value = value;
        setSelectedType(value);
        if (value === "nil") {
            customProps?.validate(model.name, false);
        }
    };

    const selector = model && model.members && model.members.length > 1 && (
        <SelectDropdownWithButton
            onChange={handleTypeChange}
            customProps={{
                values: getTypes(),
                disableCreateNew: true,
                className: "unionDropdown",
                optional: model.optional,
            }}
            defaultValue={selectedType}
            placeholder="Select Type"
        />
    );

    return (
        <div className={classes.groupedFormUnion}>
            {model && model.optional ? (
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}>{textLabel}</FormHelperText>
                    <FormHelperText className={classes.optionalLabel}>
                        <FormattedMessage id="lowcode.develop.elements.enum.optional.label" defaultMessage="Optional" />
                    </FormHelperText>
                </div>
            ) : (
                <div className={classes.labelWrapper}>
                    <FormHelperText className={classes.inputLabelForRequired}>{textLabel}</FormHelperText>
                    <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
                </div>
            )}
            {selector}
        </div>
    );
}
