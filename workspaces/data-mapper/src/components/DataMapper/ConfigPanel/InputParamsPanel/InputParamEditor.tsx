/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
import React, { useState } from "react";

import styled from "@emotion/styled";
import { Box, Checkbox, FormControlLabel, Grid } from "@material-ui/core";
import { FormTextInput, PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import camelCase from 'lodash.camelcase';

import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";

import { DataMapperInputParam } from "./types";

interface InputParamEditorProps {
    index?: number;
    param?: DataMapperInputParam,
    onSave?: (param: DataMapperInputParam) => void;
    onUpdate?: (index: number, param: DataMapperInputParam) => void;
    onCancel?: () => void;
    validateParamName?: (paramName: string) => { isValid: boolean, message: string };
    isArraySupported: boolean;
    completions: CompletionResponseWithModule[];
    loadingCompletions: boolean;
    hideName?: boolean;
}

export function InputParamEditor(props: InputParamEditorProps) {

    const { param, onSave, onUpdate, index, onCancel, validateParamName, isArraySupported, completions, loadingCompletions, hideName } = props;

    const initValue: DataMapperInputParam = param ? { ...param } : {
        name: "",
        type: "",
        isArray: false,
    };

    const [paramType, setParamType] = useState<string>(param?.type || "");
    const [paramName, setParamName] = useState<string>(param?.name || "");
    const [pramError, setParamError] = useState<string>("");
    const [isValidParam, setIsValidParam] = useState(true);
    const [isArray, setIsArray] = useState<boolean>(param?.isArray);

    const validateNameValue = (value: string) => {
        if (value && validateParamName) {
            const { isValid, message } = validateParamName(value);
            setIsValidParam(isValid);
            if (!isValid) {
                setParamError(message);
            }
        }
        setParamError("");
        return true;
    };

    const handleOnSave = () => {
        onSave({
            ...initValue,
            name: paramName,
            type: paramType,
            isArray
        });
    };

    const handleOnUpdate = () => {
        onUpdate(index, {
            ...initValue,
            name: paramName,
            type: paramType,
            isArray
        });
    };

    const handleParamTypeChange = (type: string) => {
        setParamType(type);
        if (type && type.length > 1) {
            setParamName(camelCase(type.split(':').pop()));
        }
    }

    return (
        <ParamEditorContainer>
            <Grid container={true} spacing={1}>
                <Grid item={true} xs={hideName ? 12 : 8}>
                    <IputLabel>Type</IputLabel>
                    <TypeBrowser
                        type={paramType}
                        onChange={handleParamTypeChange}
                        isLoading={loadingCompletions}
                        recordCompletions={completions}
                    />
                </Grid>
                {!hideName && (
                    <Grid item={true} xs={4}>
                        <IputLabel>Name</IputLabel>
                        <FormTextInput
                            defaultValue={paramName}
                            customProps={{ validate: validateNameValue }}
                            onChange={setParamName}
                            errorMessage={pramError}
                        />
                    </Grid>
                )}

            </Grid>
            <Box mt={1} />
            <Grid container={true} item={true} spacing={2}>
                <Grid item={true} xs={6}>
                    {isArraySupported && (
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={isArray}
                                    onChange={(event) => setIsArray(event.target.checked)}
                                    color="primary"
                                />
                            )}
                            label="Is Array"
                        />
                    )}

                </Grid>
                <Grid item={true} xs={6}>
                    <ButtonContainer>
                        <SecondaryButton
                            text="Cancel"
                            fullWidth={false}
                            onClick={onCancel}
                        />
                        <PrimaryButton
                            text={onUpdate ? "Update" : " Add"}
                            disabled={(!hideName && !paramName) || !paramType || pramError !== "" || !isValidParam}
                            fullWidth={false}
                            onClick={onUpdate ? handleOnUpdate : handleOnSave}
                        />
                    </ButtonContainer>
                </Grid>
            </Grid>
        </ParamEditorContainer>
    );
}


const ParamEditorContainer = styled.div(() => ({
    boxSizing: "border-box",
    height: "153px",
    width: "100%",
    border: "1px solid #EEEEEE",
    borderRadius: "5px",
    backgroundColor: "#F7F8FB",
    padding: "15px 10px",
    margin: "5px",
}));

const IputLabel = styled.div(() => ({
    height: "24px",
    width: "38px",
    color: "#1D2028",
    fontSize: "13px",
    letterSpacing: "0",
    lineHeight: "24px"
}));

const ButtonContainer = styled.div(() => ({
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "1px"
}))
