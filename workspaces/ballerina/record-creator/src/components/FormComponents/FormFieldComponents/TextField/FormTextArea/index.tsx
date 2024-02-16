/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useRef, useState } from "react";

import "./style.scss";
import { useStyles } from "./style";
import { cx } from "@emotion/css";
import { TextArea, Typography } from "@wso2-enterprise/ui-toolkit";
import { FormField } from "../../../../../types";

interface FormTextAreaProps {
    validate?: (field: string, isInvalid: boolean) => void;
    rowsMax?: number;
    defaultValue?: string;
    label?: string;
    placeholder?: string;
    isInvalid?: boolean;
    text?: string;
}

interface FormElementProps<T = {}> {
    onChange?: (event: any) => void;
    customProps?: T;
    model?: FormField | any;
    validate?: (field: string, isInvalid: boolean) => void;
    rowsMax?: number;
    defaultValue?: string;
    label?: string;
    placeholder?: string;
    isInvalid?: boolean;
    text?: string;
}

export function FormTextArea(props: FormElementProps<FormTextAreaProps>) {
    const classes = useStyles();
    const { onChange, defaultValue, placeholder, rowsMax, customProps, model } = props;
    const defaultText: string = defaultValue ? defaultValue : "";
    const errorClass = customProps?.isInvalid ? cx("error-class") : cx("valid");
    const codeAreaRef = useRef<HTMLTextAreaElement>(null);

    const [inputValue, setInputValue] = useState(defaultText);

    if (customProps?.validate !== undefined) {
        customProps?.validate(model.name, inputValue === "");
    }

    const handleOnChange = (event: any) => {
        if (event.keyCode === 9) {
            event.preventDefault();
            const { selectionStart } = event.target;
            codeAreaRef.current.setRangeText(
                "  ",
                selectionStart,
                selectionStart,
                "end"
              );
        }
        setInputValue(event.target.value);
        onChange(event.target.value);
    };

    React.useEffect(() => {
        setInputValue(defaultText);
    }, [defaultText]);

    const handleOnKeyDown = (event: any) => {
        if (event.keyCode === 9) {
            event.preventDefault();
            const { selectionStart } = event.target;
            codeAreaRef.current.setRangeText(
                "  ",
                selectionStart,
                selectionStart,
                "end"
              );
          }
    }

    return (
        <div className="textarea-wrapper">
            <div className={errorClass}>
                <TextArea
                    ref={codeAreaRef}
                    className={classes.textArea}
                    placeholder={placeholder}
                    onChange={handleOnChange}
                    value={inputValue}
                    resize="vertical"
                />
                {customProps?.text ? (
                    <Typography variant="body2" className='textarea-error-text'>{customProps.text}</Typography>
                ) : null}
            </div>
        </div>
    );
}
