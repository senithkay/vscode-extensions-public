/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";

import { InputAdornment } from "@material-ui/core";

import Button from "../../ChoreoSystem/Button/Button";
import { Lock, Unlock } from "../../ChoreoSystem/Icons/generated";
import TextInput from "../../ChoreoSystem/TextInput/TextInput";
import { useStyles } from "../../style";

export interface TextFieldInputProps {
  id?: string;
  isRequired?: boolean;
  name?: string;
  value: any;
  valueRef?: string;
  isSensitiveField?: boolean;
  disabled?: boolean;
  type: string;
  inputProps?: object;
  placeholder?: string;
  setTextFieldValue?: (
    id: string,
    value: any,
    valuRef: any,
    isSensitiveField: boolean
  ) => void;
  handleMarkSecret?: (isSecret: boolean) => void;
  enableMarkingSecret?: boolean;
}

export function TextFieldInput(props: TextFieldInputProps) {
  const classes = useStyles();
  const {
    id,
    isRequired,
    value,
    valueRef,
    type,
    inputProps,
    placeholder,
    setTextFieldValue,
    name,
    disabled,
    isSensitiveField,
    enableMarkingSecret
  } = props;
  const [inputValue, setInputValue] = useState(
    value ? String(value) : undefined
  );
  const [inputValueRef, setInputValueRef] = useState(
    valueRef ? String(valueRef) : undefined
  );
  const [inputSensitiveField, setInputSensitiveField] = useState(
    isSensitiveField !== undefined ? isSensitiveField : false
  );

  const handleEndButtonClick = () => {
    props.handleMarkSecret(!inputSensitiveField);
    setInputSensitiveField(!inputSensitiveField);
  };

  useEffect(() => {
    setTextFieldValue(id, inputValue, inputValueRef, inputSensitiveField);
  }, [id, inputValueRef, inputValue, inputSensitiveField]);

  useEffect(() => {
    setInputValueRef(valueRef);
  }, [valueRef]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setInputSensitiveField(isSensitiveField);
  }, [isSensitiveField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (type === "string") {
      newValue = handleQuotes(newValue);
    }
    setInputValue(newValue);
  };

  const newInputProps = {
    ...inputProps,
    className: classes.textInput,
  };
  return (
    <TextInput
      required={isRequired}
      placeholder={placeholder}
      fullWidth={true}
      value={inputValue}
      type={type}
      margin="none"
      onChange={handleChange}
      inputProps={newInputProps}
      data-cyid={name}
      disabled={disabled}
      endAdornment={
        enableMarkingSecret &&
        (valueRef === "" || valueRef === undefined) && (
          <InputAdornment position="end">
            <Button
              style={{ marginRight: 0 }}
              onClick={handleEndButtonClick}
              variant="link"
              endIcon={inputSensitiveField ? <Lock /> : <Unlock />}
              testId="update-secret-string"
            />
          </InputAdornment>
        )
      }
    />
  );
}

function handleQuotes(strValue: string): string {
    const startChar = strValue.charAt(0);
    const endChar = strValue.charAt(strValue.length - 1);

    if ((startChar === "\"" && endChar === "\"") || (startChar === "\'" && endChar === "\'")) {
        strValue = strValue.slice(1, -1);
    }
    return strValue;
}
