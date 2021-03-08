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

import { FormHelperText, InputAdornment, TextField as MuiTextField } from "@material-ui/core";

import { useStyles as useFormStyles } from "../../../forms/style";
import { FormElementProps } from "../../../types";
import { TooltipIcon } from "../../Tooltip";
import { useStyles as useTextInputStyles } from "../style";

interface FormTextInputProps {
    validate?: (value: any) => boolean;
    optional?: boolean;
    disableValidation?: boolean;
    inputProps?: any;
    clearInput?: boolean;
    startAdornment?: string;
    tooltipTitle?: string;
    focused?: boolean;
    disabled?: boolean;
}

export function FormTextInput(props: FormElementProps<FormTextInputProps>) {
    const { index, customProps, onChange, defaultValue, label, placeholder, errorMessage, dataTestId, size = "medium" } = props;
    const formClasses = useFormStyles();
    const textFieldClasses = useTextInputStyles();
    // const defaultText: string = defaultValue ? defaultValue : "";
    const textLabel = label ? label : "";

    // const [inputValue, setInputValue] = useState(defaultText);

    if (customProps?.clearInput) {
        // setting the prop to false to avoid render loop
        customProps.clearInput = false;
        // setInputValue("");
    }

    // checks for empty fields when navigating back
    const isValidInput: boolean = (customProps?.validate !== undefined && ((customProps &&
        customProps?.disableValidation !== undefined && !customProps?.disableValidation) ||
        (customProps && customProps?.disableValidation === undefined)))
        ? customProps?.validate(defaultValue)
        : true;

    // to render invalid variable
    const [isInvalid, setIsInvalid] = useState(!isValidInput);

    const handleOnChange = (event: any) => {
        event.stopPropagation();
        if (onChange) {
            onChange(event.target.value);
        }

        if (customProps?.validate && ((customProps && customProps.disableValidation !== undefined
            && !customProps.disableValidation) || (customProps && customProps.disableValidation === undefined))) {
            setIsInvalid(!customProps.validate(event.target.value));
        }
        // setInputValue(event.target.value);
    };

    return (
        <>
            {textLabel !== "" ?
                (customProps && customProps.optional ?
                    (
                        <div className={textFieldClasses.inputWrapper}>
                            <div className={textFieldClasses.inputWrapper}>
                                <div className={textFieldClasses.labelWrapper}>
                                    <FormHelperText className={formClasses.inputLabelForRequired}>{textLabel}</FormHelperText>
                                    <FormHelperText className={formClasses.optionalLabel}>Optional</FormHelperText>
                                </div>

                            </div>
                            {customProps?.tooltipTitle &&
                                (
                                    <TooltipIcon title={customProps?.tooltipTitle} arrow={true} />
                                )
                            }
                        </div>
                    ) : (
                        <div className={textFieldClasses.inputWrapper}>
                            <div className={textFieldClasses.labelWrapper}>
                                <FormHelperText className={formClasses.inputLabelForRequired}>{textLabel}</FormHelperText>
                                <FormHelperText className={formClasses.starLabelForRequired}>*</FormHelperText>
                            </div>
                            {customProps?.tooltipTitle &&
                                (<TooltipIcon title={customProps?.tooltipTitle} arrow={true} />)
                            }
                        </div>

                    )
                ) : null
            }

            <MuiTextField
                data-testid={dataTestId}
                error={isInvalid}
                key={index}
                InputProps={{
                    disableUnderline: true,
                    // tslint:disable-next-line: jsx-curly-spacing
                    classes: {
                        root: textFieldClasses.textFeild,
                        error: textFieldClasses.errorField,
                    },
                    startAdornment: customProps?.startAdornment ? <InputAdornment position="start">{customProps.startAdornment}</InputAdornment> : null
                }}
                placeholder={placeholder}
                fullWidth={true}
                size={size}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                onChange={handleOnChange}
                value={defaultValue ? defaultValue : ""}
                helperText={isInvalid ? errorMessage : ""}
                autoFocus={customProps?.focused}
                disabled={customProps?.disabled}
            />

        </>
    );
}
