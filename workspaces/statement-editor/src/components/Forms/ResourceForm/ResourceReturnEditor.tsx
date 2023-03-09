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

import React, { useState } from 'react';

import { Button } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { connectorStyles } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { STNode } from '@wso2-enterprise/syntax-tree';
import { Diagnostic } from 'vscode-languageserver-protocol';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";

import { Param } from './ParamEditor/ParamEditor';
import { ParameterConfig } from './ParamEditor/ParamItem';
import { responseCodes, ResponseEditor } from './ResponseEditor/ResponseEditor';
import { ResponseItem } from './ResponseEditor/ResponseItem';

export interface QueryParamEditorProps {
    returnSource: string;
    completions: SuggestionItem[];
    onChange: (paramString: string, model?: STNode, currentValue?: string, avoidValueCommit?: boolean) => void,
    syntaxDiag?: Diagnostic[];
    readonly?: boolean;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export const RESOURCE_PAYLOAD_PREFIX = "@http:Payload";
export const RESOURCE_HEADER_PREFIX = "@http:Header";
export const RESOURCE_REQUEST_TYPE = "http:Request";
export const RESOURCE_CALLER_TYPE = "http:Caller";
export const RESOURCE_HEADER_MAP_TYPE = "http:Headers";

export function ResourceReturnEditor(props: QueryParamEditorProps) {
    const { returnSource, completions, onChange, syntaxDiag, readonly, onChangeInProgress } = props;
    const connectorClasses = connectorStyles();
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState<boolean>(false);

    const responses = getReturnTypesArray();

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

    const onParamChange = (segmentId: number, responseCode: string, withType?: string) => {
        const responseData = responseCodes.find(item => item.code.toString() === responseCode);
        const newReturn = withType ? withType : (responseData ? responseData.source : "");
        if (segmentId === -1) {
            responses.push(newReturn);
        } else {
            responses[segmentId] = newReturn;
        }
        const newSource = responses.join("|");
        onChange(newSource);
        setEditingSegmentId(segmentId); // this should be segmentID
        onChangeInProgress(false);
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

    const paramNames: string[] = [];


    const paramComponents: React.ReactElement[] = [];


    function getReturnTypesArray() {
        const returnTypes = returnSource ? returnSource.replace("returns", "").split(/\|(?![^\{]*[\}])/gm) : [];
        return returnTypes;
    }

    getReturnTypesArray().forEach((item: string, index: number) => {
        if ((editingSegmentId !== index)) {
            paramComponents.push(
                <ResponseItem
                    param={{
                        id: index,
                        name: item,
                        type: item,
                        option: item
                    }}
                    readonly={editingSegmentId !== -1 || readonly}
                    onDelete={onDelete}
                    onEditClick={onEdit}
                />
            );
        } else if (editingSegmentId === index && !isNew) {
            paramComponents.push(
                <ResponseEditor
                    segmentId={editingSegmentId}
                    syntaxDiagnostics={syntaxDiag}
                    model={item.trim()}
                    completions={completions}
                    isEdit={true}
                    alternativeName={""}
                    optionList={responseCodes}
                    option={"200"}
                    isTypeReadOnly={false}
                    onChange={onParamChange}
                    onCancel={onParamEditCancel}
                />
            )
        }
    })

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
        />
    );
    // parameters
    //     .forEach((param, index) => {
    //         if (STKindChecker.isCommaToken(param)
    //             || param.source.includes(RESOURCE_PAYLOAD_PREFIX)
    //             || param.source.includes(RESOURCE_CALLER_TYPE)
    //             || param.source.includes(RESOURCE_REQUEST_TYPE)
    //             || param.source.includes(RESOURCE_HEADER_MAP_TYPE)
    //         ) {
    //             return;
    //         }
    //         if ((editingSegmentId !== index)) {
    //             paramComponents.push(
    //                 <ParamItem
    //                     param={{
    //                         id: index,
    //                         name: getParameterNameFromModel(param),
    //                         type: getParameterTypeFromModel(param),
    //                         option: param.source.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT
    //                     }}
    //                     readonly={editingSegmentId !== -1 || readonly}
    //                     onDelete={onDelete}
    //                     onEditClick={onEdit}
    //                 />
    //             );
    //         } else if (editingSegmentId === index) {
    //             isEditing = true;
    //             paramComponents.push(
    //                 <ResponseEditor
    //                     segmentId={index}
    //                     syntaxDiagnostics={syntaxDiag}
    //                     model={param}
    //                     completions={completions}
    //                     isEdit={true}
    //                     alternativeName={param.source.includes(RESOURCE_HEADER_PREFIX) ? "Identifier Name" : "Name"}
    //                     optionList={responseCodes}
    //                     option={"200"}
    //                     isTypeReadOnly={false}
    //                     onChange={onParamChange}
    //                     onCancel={onParamEditCancel}
    //                 />
    //             )
    //         }
    //     });

    return (
        <div>
            {paramComponents}
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
            {/* {(editingSegmentId !== -1) && !isEditing && (
                <div>
                    <TextPreloaderVertical position="fixedMargin" />
                </div>
            )} */}
            {isNew && resourceForm}
        </div>
    );
}
