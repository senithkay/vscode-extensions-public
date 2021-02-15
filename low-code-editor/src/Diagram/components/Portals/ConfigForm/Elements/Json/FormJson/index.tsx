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
import React, { useState } from "react";

import { FormHelperText } from "@material-ui/core";

import { useStyles } from "../../../forms/style";
import { FormElementProps } from "../../../types";
import { FormTextArea } from "../../TextField/FormTextArea";

interface FormJsonProps {
    validate?: (field: string, isInvalid: boolean) => void;
}

export function FormJson(props: FormElementProps<FormJsonProps>) {
    const { model, customProps, onChange, defaultValue } = props;
    const classes = useStyles();

    const [validJson, setValidJson] = useState(true);

    const validateJson = (value: string) => {
        try {
            JSON.parse(value);
            model.value = value;
            if (value !== "") {
                setValidJson(true);
                if (customProps?.validate) {
                    customProps?.validate(model.name, false);
                }
            }
        } catch (e) {
            setValidJson(false);
            if (customProps?.validate) {
                customProps?.validate(model.name, true);
            }
        }
    };

    const onCustomJsonChange = (jsonValue: string) => {
        validateJson(jsonValue);
        if (onChange) {
            onChange(jsonValue);
        }
    };

    return (
        <div className={classes.arraySubWrapper} data-testid="json">
            <div className={classes.labelWrapper}>
                <FormHelperText className={classes.inputLabelForRequired}>Enter Custom JSON</FormHelperText>
                <FormHelperText className={classes.starLabelForRequired}>*</FormHelperText>
            </div>
            <FormTextArea
                onChange={onCustomJsonChange}
                customProps={{ isInvalid: !validJson, text: "Invalid Json" }}
                rowsMax={3}
                placeholder='eg: {"key1": "value1", "key2": "value2"}'
                defaultValue={defaultValue}
            />
        </div>
    );
}
