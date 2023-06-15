/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
// tslint:disable: jsx-no-multiline-js

import React, { useContext, useEffect, useState } from 'react';
import { monaco } from 'react-monaco-editor';

import { Button, LinearProgress } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { BallerinaSTModifyResponse, CompletionResponse, DiagramEditorLangClientInterface, responseCodes } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { connectorStyles } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { ResourceAccessorDefinition, STNode, traversNode, TypeDefinition } from '@wso2-enterprise/syntax-tree';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from '../../../store/form-editor-context';
import { visitor as RecordsFinderVisitor } from "../../../visitors/records-finder-visitor";

import { Param } from './ParamEditor/ParamEditor';
import { ParameterConfig } from './ParamEditor/ParamItem';
import { ResponseEditor } from './ResponseEditor/ResponseEditor';
import { ResponseItem } from './ResponseEditor/ResponseItem';
import { getKeywordTypes, HTTP_POST } from './util';

export interface QueryParamEditorProps {
    returnSource: string;
    completions: SuggestionItem[];
    onChange: (paramString: string, model?: STNode, currentValue?: string, avoidValueCommit?: boolean) => void,
    syntaxDiag?: StatementSyntaxDiagnostics[];
    readonly?: boolean;
    onChangeInProgress?: (isInProgress: boolean) => void;
    model: ResourceAccessorDefinition,
    onFocus: () => void
}

export const RESOURCE_PAYLOAD_PREFIX = "@http:Payload";
export const RESOURCE_HEADER_PREFIX = "@http:Header";
export const RESOURCE_REQUEST_TYPE = "http:Request";
export const RESOURCE_CALLER_TYPE = "http:Caller";
export const RESOURCE_HEADER_MAP_TYPE = "http:Headers";

export function ResourceReturnEditor(props: QueryParamEditorProps) {
    const { returnSource, completions, onChange, syntaxDiag, readonly, onChangeInProgress, model, onFocus } = props;
    const connectorClasses = connectorStyles();
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState<boolean>(false);
    const [types, setTypes] = useState([]);
    const [paramComponents, setParamComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [returnSourceOld, setReturnSourceOld] = useState(returnSource.replace("returns", ""));
    const [updatedSource, setUpdatedSource] = useState(returnSource.replace("returns", ""));

    const responses = getReturnTypesArray();

    const {
        currentFile, getLangClient, fullST
    } = useContext(FormEditorContext);

    useEffect(() => {
        getKeywordTypes(currentFile.path, getLangClient).then(setTypes);
    }, []);

    useEffect(() => {
        if (types.length > 0) {
            renderResponses(types).then(setParamComponents);
        }
        if (editingSegmentId !== -1) {
            onFocus();
        }
    }, [model, types, editingSegmentId]);

    traversNode(fullST, RecordsFinderVisitor);
    const records = RecordsFinderVisitor.getRecords();

    const onEdit = (param: Param) => {
        setEditingSegmentId(param.id);
        setIsNew(false);
        onChangeInProgress(true);
    };

    const onDelete = (param: ParameterConfig) => {
        let newSource = "error?";
        if (responses.length > 1) {
            responses.splice(param.id, 1)
            newSource = responses.join("|");
        }
        onChange(newSource);
        setReturnSourceOld(newSource);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        setIsNew(false);
    };

    const onParamChange = (segmentId: number, responseCode: number, withType?: string) => {
        const responseData = responseCodes.find(item => item.code === responseCode);
        const newReturn = withType ? withType : (responseData ? responseData.source : "");
        if (segmentId === -1) {
            responses.push(newReturn);
        } else {
            responses[segmentId] = newReturn;
        }
        const newSource = responses.join("|");
        onChange(newSource);
        setUpdatedSource(newSource);
        setEditingSegmentId(segmentId); // this should be segmentID
    };



    const addReturn = () => {
        setEditingSegmentId(responses.length);
        setIsNew(true);
        onChangeInProgress(true);
    };

    const onParamEditCancel = (revertChange?: boolean) => {
        if (revertChange) {
            onChange(returnSourceOld);
        } else {
            setReturnSourceOld(updatedSource);
        }
        setEditingSegmentId(-1);
        setIsNew(false);
        onChangeInProgress(false);
    };

    function getReturnTypesArray() {
        const returnTypes = returnSource ? returnSource.replace("returns", "").split(/\|(?![^\{]*[\}])/gm) : [];
        return returnTypes;
    }

    const getRecord = async (
        recordName: any,
        langClient: DiagramEditorLangClientInterface,
    ): Promise<BallerinaSTModifyResponse> => {
        const record: STNode = records.get(recordName.replace(/[\[\]\?]/g, "").trim());
        if (record) {
            const request: TextDocumentPositionParams = {
                textDocument: { uri: monaco.Uri.file(currentFile.path).toString() },
                position: { line: record.position.startLine, character: record.position.startColumn }
            };
            return langClient.getDefinitionPosition(request);
        }
    };

    function defaultResponseCode() {
        const isPost = model?.functionName.value.toUpperCase() === HTTP_POST;
        return isPost ? "201" : "200";
    }

    async function renderResponses(keywordTypes: CompletionResponse[]) {
        const values = await getReturnTypesArray();
        const langClient = await getLangClient();
        const renderResponsesArr = [];

        for (const [index, value] of values.entries()) {
            let code = defaultResponseCode();
            const recordName = value.trim();

            responseCodes.forEach(item => {
                if (recordName.includes(item.source)) {
                    code = item.code.toString();
                }
            });

            keywordTypes.forEach(item => {
                if (recordName.replace(/\[\]/g, "").trim() === item.insertText) {
                    code = defaultResponseCode();
                }
            })

            const recordInfo = await getRecord(recordName, langClient);
            if (recordInfo && recordInfo.parseSuccess) {
                const ST: TypeDefinition = recordInfo.syntaxTree as TypeDefinition;
                code = defaultResponseCode();
                responseCodes.forEach(item => {
                    if (ST.source.includes(item.source)) {
                        code = item.code.toString();
                    }
                });
            }

            if (value.includes("error")) {
                code = "500";
            }

            if ((editingSegmentId !== index)) {
                renderResponsesArr.push(
                    <ResponseItem
                        key={index}
                        param={{
                            id: index,
                            name: recordName,
                            type: code,
                            option: recordName
                        }}
                        readonly={recordName.trim().includes("error") || editingSegmentId !== -1 || readonly}
                        onDelete={onDelete}
                        onEditClick={onEdit}
                    />
                );
            } else if (editingSegmentId === index && !isNew) {
                renderResponsesArr.push(
                    <ResponseEditor
                        segmentId={editingSegmentId}
                        syntaxDiagnostics={syntaxDiag}
                        model={recordName.trim()}
                        completions={completions}
                        isEdit={true}
                        alternativeName={""}
                        optionList={responseCodes.filter(c => c.code !== 500)}
                        option={defaultResponseCode()}
                        isTypeReadOnly={false}
                        onChange={onParamChange}
                        onCancel={onParamEditCancel}
                        httpMethodName={model?.functionName?.value?.toUpperCase()}
                    />
                )
            }
        }

        setIsLoading(false);
        return renderResponsesArr;
    }

    const resourceForm = (
        <ResponseEditor
            segmentId={editingSegmentId}
            syntaxDiagnostics={syntaxDiag}
            model={""}
            completions={completions}
            isEdit={true}
            alternativeName={""}
            optionList={responseCodes.filter(code => code.code !== 500)}
            option={defaultResponseCode()}
            isTypeReadOnly={false}
            onChange={onParamChange}
            onCancel={onParamEditCancel}
            httpMethodName={model?.functionName?.value?.toUpperCase()}
        />
    );

    return (
        <div>
            {isLoading && <LinearProgress />}
            {!isLoading && paramComponents}
            {(editingSegmentId === -1) && (
                <div>
                    <Button
                        data-test-id="response-add-button"
                        onClick={addReturn}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon />}
                        color="primary"
                        disabled={readonly}
                    >
                        Add Response
                    </Button>
                </div>
            )}
            {isNew && resourceForm}
        </div>
    );
}
