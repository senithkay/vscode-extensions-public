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

import { TextareaAutosize } from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import { FormElementProps } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import cn from "classnames";

import { useStyles } from "../style";

import "./style.scss";

export interface FormTextAreaProps {
    validate?: (field: string, isInvalid: boolean) => void;
    rowsMax?: number;
    defaultValue?: string;
    label?: string;
    placeholder?: string;
    isInvalid?: boolean;
    text?: string;
}

export function FormTextArea(props: FormElementProps<FormTextAreaProps>) {
    const { onChange, defaultValue, placeholder, rowsMax, customProps, model } = props;
    const classes = useStyles();
    const defaultText: string = defaultValue ? defaultValue : "";
    const errorClass = customProps?.isInvalid ? cn("error-class") : cn("valid");

    const [inputValue, setInputValue] = useState(defaultText);

    if (customProps?.validate !== undefined) {
        customProps?.validate(model.name, inputValue === "");
    }

    const handleOnChange = (event: any) => {
        setInputValue(event.target.value);
        onChange(event.target.value);
    };

    React.useEffect(() => {
        setInputValue(defaultText);
    }, [defaultText]);

    return (
        <div className="textarea-wrapper">
            <div className={errorClass}>
                <TextareaAutosize
                    className={classes.textArea}
                    placeholder={placeholder}
                    rowsMax={rowsMax}
                    onChange={handleOnChange}
                    value={inputValue}
                />
                {customProps?.text ? (
                    <Typography variant="body2" className='textarea-error-text'>{customProps.text}</Typography>
                ) : null}
            </div>
        </div>
    );
}
