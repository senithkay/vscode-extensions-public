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
import React, { useState } from "react";

import { Grid } from "@material-ui/core";
import { FormTextInput, PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { DataMapperInputParam } from "./types";
import styled from "@emotion/styled";
import { TypeBrowser } from "../TypeBrowser";

interface InputParamEditorProps {
    index?: number;
    param?: DataMapperInputParam,
    onSave?: (param: DataMapperInputParam) => void;
    onUpdate?: (index: number, param: DataMapperInputParam) => void;
    onCancel?: () => void;
    validateParamName?: (paramName: string) => { isValid: boolean, message: string };
}

export function InputParamEditor(props: InputParamEditorProps) {

    const { param, onSave, onUpdate, index, onCancel, validateParamName } = props;

    const initValue: DataMapperInputParam = param ? { ...param } : {
        name: "",
        type: "",
    };

    const [paramType, setParamType] = useState<string>(param?.type || "");
    const [paramName, setParamName] = useState<string>(param?.name || "");
    const [pramError, setParamError] = useState<string>("");
    const [isValidParam, setIsValidParam] = useState(true);

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
        });
    };

    const handleOnUpdate = () => {
        onUpdate(index, {
            ...initValue,
            name: paramName,
            type: paramType,
        });
    };

    return (
        <ParamEditorContainer>
            <div>
                <Grid container={true} spacing={1}>
                    <Grid item={true} xs={5}>
                        <IputLabel>
                            Type
                        </IputLabel>
                    </Grid>
                    <Grid item={true} xs={7}>
                        <IputLabel>
                            Name
                        </IputLabel>
                    </Grid>
                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={5}>
                        <TypeBrowser type={paramType} onChange={setParamType} />
                    </Grid>
                    <Grid item={true} xs={7}>
                        <FormTextInput
                            defaultValue={paramName}
                            customProps={{validate: validateNameValue}}
                            onChange={setParamName}
                            errorMessage={pramError}
                        />
                    </Grid>

                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={12}>
                        <ButtonContainer>
                            <SecondaryButton
                                text="Cancel"
                                fullWidth={false}
                                onClick={onCancel}
                            />
                            <PrimaryButton
                                text={onUpdate ? "Update" : " Add"}
                                disabled={!paramName || !paramType || pramError !== "" || !isValidParam}
                                fullWidth={false}
                                onClick={onUpdate ? handleOnUpdate : handleOnSave}
                            />
                        </ButtonContainer>
                    </Grid>
                </Grid>
            </div>
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
    padding: "10px",
    margin: "5px"
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