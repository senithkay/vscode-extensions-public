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

import ChipInput from 'material-ui-chip-input';

import { validateEmail } from "../../../../utils";
import { FormElementProps } from "../../../types";
import { useStyles } from "../style";

export interface FormChipTextInputProps {
    validate?: (field: string, isInvalid: boolean) => void;
}

export function FormChipTextInput(props: FormElementProps<FormChipTextInputProps>) {
    const { model, customProps } = props;
    const classes = useStyles();

    const textLabel = model && model.displayName ? model.displayName : model.name;
    const fieldNecessity = model && model.optional ? " (Optional):" : "*:";

    if (model && model.value === undefined) {
        model.value = [];
    }
    const defalultVal: any[] = model.value.map((element: any) => {
        return model.type === "collection" ?
            typeof element === 'string' ? (element as string).replace(/["]/g, '') : element
            : element.value;
    });
    const [chipValues, setChipValues] = useState(defalultVal);

    if (model) {
        model.fields = undefined;
    }

    const [isInvalid, setIsInvalid] = useState(false);

    if ((customProps?.validate !== undefined) && ((model.value !== undefined && model.value !== "") || (model.value === ""))) {
        const invalid = model.optional ? false : (chipValues.length === 0);
        customProps?.validate(model.name, invalid);
    }

    const handleBeforeAdd = (chip: any): boolean => {
        const valueIsEmpty: boolean = chip === ""
        const valueIsInvalid: boolean = model.value !== undefined && model.value !== "" && !validateEmail(chip);
        setIsInvalid(chip === "" ? false : valueIsInvalid);
        if (!(valueIsEmpty || valueIsInvalid)) {
            if (model) {
                model.value = [...model.value, "\"" + chip + "\""];
            }
            setChipValues([...chipValues, chip]);
            return true;
        } else {
            return false;
        }
    }

    const handleDeleteValue = (chip: any, index: number) => {
        model.value = (model.value as number[]).filter((val: any, i: number) => { return (i !== index) })
        setChipValues(chipValues.filter((val: any, i: number) => { return (i !== index) }));
    }

    return (
        <div>
            <ChipInput
                // tslint:disable-next-line: jsx-no-multiline-js
                classes={{
                    chipContainer: classes.chipContainer,
                    root: classes.chipRoot,
                    label: classes.chipLabel,
                    chip: classes.chip,
                    helperText: classes.chipHelperText
                }}
                label={textLabel + fieldNecessity}
                onBeforeAdd={handleBeforeAdd}
                value={chipValues}
                onDelete={handleDeleteValue}
                helperText={isInvalid ? "Invalid input" : ""}
                error={isInvalid}
            />
        </div>
    );
}

