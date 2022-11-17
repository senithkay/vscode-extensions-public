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

import { Grid } from "@material-ui/core";
import { FormTextInput, PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import styled from "@emotion/styled";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import camelCase from 'lodash.camelcase';
import { CompletionItemKind } from "vscode-languageserver-protocol";
import { Uri } from "monaco-editor";
import { addToTargetPosition, CompletionParams } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { CurrentFileContext } from "../../Context/current-file-context";
import { LSClientContext } from "../../Context/ls-client-context";
import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";
import { EXPR_SCHEME, FILE_SCHEME } from "../utils";
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
    const [isLoading, setLoading] = useState(false);
    const langClientPromise = useContext(LSClientContext);


    const { path, content } = useContext(CurrentFileContext);

    const [recordCompletions, setRecordCompletions] = useState<CompletionResponseWithModule[]>([]);

    useEffect(() => {
        (async () => {
            const typeLabelsToIgnore = ["StrandData"];
            setLoading(true);
            const completionMap = new Map<string, CompletionResponseWithModule>();
            const langClient = await langClientPromise;
            const completionParams: CompletionParams = {
                textDocument: { uri: Uri.file(path).toString() },
                position: { character: 0, line: 0 },
                context: { triggerKind: 22 },
            };
            const completions = await langClient.getCompletion(completionParams);
            const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);
            recCompletions.forEach((item) => completionMap.set(item.insertText, item));

            const exprFileUrl = Uri.file(path).toString().replace(FILE_SCHEME, EXPR_SCHEME);
            langClient.didOpen({
                textDocument: {
                    languageId: "ballerina",
                    text: currentFileContent,
                    uri: exprFileUrl,
                    version: 1,
                },
            });

            for (const importStr of imports) {
                const moduleName = importStr.split("/").pop().replace(";", "");
                const updatedContent = addToTargetPosition(
                    currentFileContent,
                    {
                        startLine: fnSTPosition.endLine,
                        startColumn: fnSTPosition.endColumn,
                        endLine: fnSTPosition.endLine,
                        endColumn: fnSTPosition.endColumn,
                    },
                    `${moduleName}:`
                );

                langClient.didChange({
                    textDocument: { uri: exprFileUrl, version: 1 },
                    contentChanges: [{ text: updatedContent }],
                });

                const completions = await langClient.getCompletion({
                    textDocument: { uri: exprFileUrl },
                    position: { character: fnSTPosition.endColumn + moduleName.length + 1, line: fnSTPosition.endLine },
                    context: { triggerKind: 22 },
                });

                const recCompletions = completions.filter((item) => item.kind === CompletionItemKind.Struct);

                recCompletions.forEach((item) => {
                    if (!completionMap.has(item.insertText)) {
                        completionMap.set(item.insertText, { ...item, module: moduleName });
                    }
                });
            }
            langClient.didChange({
                textDocument: { uri: exprFileUrl, version: 1 },
                contentChanges: [{ text: currentFileContent }],
            });

            langClient.didClose({ textDocument: { uri: exprFileUrl } });

            const allCompletions = Array.from(completionMap.values()).filter(
                (item) => !(typeLabelsToIgnore.includes(item.label) || item.label.startsWith("("))
            );
            setRecordCompletions(allCompletions);
            setLoading(false);
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
            setParamName(camelCase(type.split(':').pop()))
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
                            isLoading={isLoading}
                            recordCompletions={recordCompletions} />
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