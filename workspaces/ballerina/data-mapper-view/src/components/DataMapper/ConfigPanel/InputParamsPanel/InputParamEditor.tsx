/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
import React, { useState } from "react";

import styled from "@emotion/styled";
import { camelCase } from "lodash";

import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";

import { DataMapperInputParam } from "./types";
import { Button, TextField, Typography, Grid } from "@wso2-enterprise/ui-toolkit";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";

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

    const onUpdateParamName = (value: string) => {
        setParamName(value);
        validateNameValue(value);
    }

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
            <Grid>
                <Grid direction="row">
                    <IputLabel>Type</IputLabel>
                    <TypeBrowser
                        type={paramType}
                        onChange={handleParamTypeChange}
                        isLoading={loadingCompletions}
                        recordCompletions={completions}
                    />
                </Grid>
                {!hideName && (
                    <Grid direction="row">
                        <IputLabel>Name</IputLabel>
                        <TextField
                            value={paramName}
                            placeholder={paramName}
                            onChange={onUpdateParamName}
                            errorMsg={pramError}
                            size={40}
                        />
                    </Grid>
                )}

            </Grid>
            <Grid direction="column" sx={{ marginTop: "8px" }}>
                <Grid>
                    {isArraySupported && (
                        <FormControlLabel>
                            <VSCodeCheckbox
                                checked={isArray}
                                onChange={event => setIsArray((event.target as HTMLInputElement).checked)}
                            />
                            <Typography variant="h4" sx={{ textWrap: "nowrap" }}>Is Array</Typography>
                        </FormControlLabel>
                    )}

                </Grid>
                <Grid>
                    <ButtonContainer>
                        <Button
                            appearance="secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            disabled={(!hideName && !paramName) || !paramType || pramError !== "" || !isValidParam}
                            onClick={onUpdate ? handleOnUpdate : handleOnSave}
                        >
                            {onUpdate ? "Update" : " Add"}
                        </Button>
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
    border: "1px solid var(--vscode-editorIndentGuide-background)",
    backgroundColor: "var(--vscode-editorWidget-background)",
    padding: "15px 10px"
}));

const IputLabel = styled.div(() => ({
    height: "24px",
    width: "38px",
    color: "var(--vscode-input-foreground)",
    fontSize: "13px",
    letterSpacing: "0",
    lineHeight: "24px"
}));

const ButtonContainer = styled.div(() => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "auto",
}))

const FormControlLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;
