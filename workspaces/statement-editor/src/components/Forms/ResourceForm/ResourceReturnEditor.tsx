/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import React, { useContext, useEffect, useState } from 'react';
import { monaco } from 'react-monaco-editor';

import { Button, LinearProgress } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { BallerinaSTModifyResponse, CompletionResponse, DiagramEditorLangClientInterface, responseCodes } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { connectorStyles } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { ResourceAccessorDefinition, STNode, traversNode, TypeDefinition } from '@wso2-enterprise/syntax-tree';
import { Diagnostic, TextDocumentPositionParams } from 'vscode-languageserver-protocol';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from '../../../store/form-editor-context';
import { visitor as RecordsFinderVisitor } from "../../../visitors/records-finder-visitor";

import { Param } from './ParamEditor/ParamEditor';
import { ParameterConfig } from './ParamEditor/ParamItem';
import { ResponseEditor } from './ResponseEditor/ResponseEditor';
import { ResponseItem } from './ResponseEditor/ResponseItem';
import { HTTP_POST, getKeywordTypes } from './util';

export interface QueryParamEditorProps {
    returnSource: string;
    completions: SuggestionItem[];
    onChange: (paramString: string, model?: STNode, currentValue?: string, avoidValueCommit?: boolean) => void,
    syntaxDiag?: StatementSyntaxDiagnostics[];
    readonly?: boolean;
    onChangeInProgress?: (isInProgress: boolean) => void;
    model: ResourceAccessorDefinition
}

export const RESOURCE_PAYLOAD_PREFIX = "@http:Payload";
export const RESOURCE_HEADER_PREFIX = "@http:Header";
export const RESOURCE_REQUEST_TYPE = "http:Request";
export const RESOURCE_CALLER_TYPE = "http:Caller";
export const RESOURCE_HEADER_MAP_TYPE = "http:Headers";

export function ResourceReturnEditor(props: QueryParamEditorProps) {
    const { returnSource, completions, onChange, syntaxDiag, readonly, onChangeInProgress, model } = props;
    const connectorClasses = connectorStyles();
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState<boolean>(false);
    const [types, setTypes] = useState([]);
    const [paramComponents, setParamComponents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
        setEditingSegmentId(segmentId); // this should be segmentID
    };



    const addReturn = () => {
        setEditingSegmentId(responses.length);
        setIsNew(true);
        onChangeInProgress(true);
    };

    const onParamEditCancel = () => {
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
        const record: STNode = records.get(recordName.replace(/\[\]/g, "").trim());
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
        const responses = [];

        for (const [index, value] of values.entries()) {
            let code = "500";
            let recordName = value.trim();

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

            if ((editingSegmentId !== index)) {
                responses.push(
                    <ResponseItem
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
                responses.push(
                    <ResponseEditor
                        segmentId={editingSegmentId}
                        syntaxDiagnostics={syntaxDiag}
                        model={recordName.trim()}
                        completions={completions}
                        isEdit={true}
                        alternativeName={""}
                        optionList={responseCodes}
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
        return responses;
    }

    const resourceForm = (
        <ResponseEditor
            segmentId={editingSegmentId}
            syntaxDiagnostics={syntaxDiag}
            model={""}
            completions={completions}
            isEdit={true}
            alternativeName={""}
            optionList={responseCodes}
            option={"200"}
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
