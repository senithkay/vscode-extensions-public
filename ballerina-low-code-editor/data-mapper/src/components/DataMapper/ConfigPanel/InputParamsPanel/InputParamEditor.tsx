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
import React, { useContext, useEffect, useState } from "react";

import styled from "@emotion/styled";
import { Grid } from "@material-ui/core";
import { FormTextInput, PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import camelCase from 'lodash.camelcase';

import { getRecordCompletions } from "../../../Diagram/utils/ls-utils";
import { CurrentFileContext } from "../../Context/current-file-context";
import { LSClientContext } from "../../Context/ls-client-context";
import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";

import { DataMapperInputParam } from "./types";

interface InputParamEditorProps {
    index?: number;
    param?: DataMapperInputParam,
    onSave?: (param: DataMapperInputParam) => void;
    onUpdate?: (index: number, param: DataMapperInputParam) => void;
    onCancel?: () => void;
    validateParamName?: (paramName: string) => { isValid: boolean, message: string };
    imports: string[];
    fnSTPosition: NodePosition;
    currentFileContent: string;
}

export function InputParamEditor(props: InputParamEditorProps) {

    const { param, onSave, onUpdate, index, onCancel, validateParamName, currentFileContent, fnSTPosition, imports } = props;

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
    const [fetchingCompletions, setFetchingCompletions] = useState(false);
    const langClientPromise = useContext(LSClientContext);


    const { path, content } = useContext(CurrentFileContext);

    const [recordCompletions, setRecordCompletions] = useState<CompletionResponseWithModule[]>([]);

    useEffect(() => {
        void (async () => {
            setFetchingCompletions(true);
            const allCompletions = await getRecordCompletions(currentFileContent, langClientPromise, imports,
                                            fnSTPosition , path)
            setRecordCompletions(allCompletions);
            setFetchingCompletions(false);
        })();
    }, [content]);

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

    const handleParamTypeChange = (type: string) => {
        setParamType(type);
        if (type && type.length > 1) {
            setParamName(camelCase(type.split(':').pop()));
        }
    }

    return (
        <ParamEditorContainer>
            <div>
                <Grid container={true} spacing={1}>
                    <Grid item={true} xs={8}>
                        <IputLabel>
                            Type
                        </IputLabel>
                    </Grid>
                    <Grid item={true} xs={4}>
                        <IputLabel>
                            Name
                        </IputLabel>
                    </Grid>
                </Grid>
                <Grid container={true} item={true} spacing={2}>
                    <Grid item={true} xs={8}>
                        <TypeBrowser
                            type={paramType}
                            onChange={handleParamTypeChange}
                            isLoading={fetchingCompletions}
                            recordCompletions={recordCompletions}
                        />
                    </Grid>
                    <Grid item={true} xs={4}>
                        <FormTextInput
                            defaultValue={paramName}
                            customProps={{ validate: validateNameValue }}
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
