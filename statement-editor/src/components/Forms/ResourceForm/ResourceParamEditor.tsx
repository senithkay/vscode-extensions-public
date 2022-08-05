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

import React, { useEffect, useState } from 'react';

import { Button } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { connectorStyles } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import {
    CommaToken, DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode
} from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";

import { Param, ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParameterConfig, ParamItem } from './ParamEditor/ParamItem';
import { genParamName, getParameterNameFromModel, getParameterTypeFromModel, getParamString } from './util';

export interface QueryParamEditorProps {
    parameters: (CommaToken | DefaultableParam | RequiredParam | IncludedRecordParam | RestParam)[];
    completions: SuggestionItem[];
    onChange: (paramString: string, model?: STNode, currentValue?: string, avoidValueCommit?: boolean) => void,
    syntaxDiag?: StatementSyntaxDiagnostics[];
    readonly?: boolean;
    onChangeInProgress?: (isInProgress: boolean) => void;
}

export const RESOURCE_PAYLOAD_PREFIX = "@http:Payload";
export const RESOURCE_HEADER_PREFIX = "@http:Header";
export const RESOURCE_REQUEST_TYPE = "http:Request";
export const RESOURCE_CALLER_TYPE = "http:Caller";
export const RESOURCE_HEADER_MAP_TYPE = "http:Headers";

export function ResourceParamEditor(props: QueryParamEditorProps) {
    const { parameters, completions, onChange, syntaxDiag, readonly, onChangeInProgress } = props;
    const connectorClasses = connectorStyles();
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const onEdit = (param: Param) => {
        setEditingSegmentId(param.id);
        onChangeInProgress(true);
    };

    const onDelete = (param: ParameterConfig) => {
        parameters.splice(param.id === 0 ? param.id : param.id - 1, 2)
        onChange(getParamString(parameters));
    };

    const onParamChange = (segmentId: number, paramString: string, focusedModel?: STNode, changedValue?: string) => {
        const newParamString = parameters.reduce((prev, current, currentIndex) => {
            if (segmentId === currentIndex) {
                return `${prev} ${paramString}`;
            }

            return `${prev}${current.source ? current.source : current.value}`;
        }, '');

        onChange(newParamString, focusedModel, changedValue);
    };



    const addParam = () => {
        let newParamString;
        let segmentId = parameters.length + 1;
        const lastParamIndex = parameters.findIndex(param => STKindChecker.isRestParam(param) || STKindChecker.isDefaultableParam(param));
        if (lastParamIndex === -1) {
            newParamString = `${getParamString(parameters)}${parameters.length === 0 ? '' : ','} string ${genParamName('param', paramNames)}`;
        } else {
            segmentId = lastParamIndex;
            newParamString = parameters.reduce((prev, current, currentIndex) => {
                let returnString = prev;
                if (currentIndex === lastParamIndex) {
                    returnString = `${returnString} string ${genParamName('param', paramNames)},`
                }

                returnString = `${returnString}${current.source ? current.source : current.value}`
                return returnString;
            }, '');
        }

        onChange(newParamString);
        setEditingSegmentId(segmentId);
        onChangeInProgress(true);
    };

    const onParamEditCancel = () => {
        setEditingSegmentId(-1);
        onChangeInProgress(false);
    };


    const paramNames: string[] = [];
    const paramComponents: React.ReactElement[] = [];
    parameters
        .forEach((param, index) => {
            if (STKindChecker.isCommaToken(param)
                || param.source.includes(RESOURCE_PAYLOAD_PREFIX)
                || param.source.includes(RESOURCE_CALLER_TYPE)
                || param.source.includes(RESOURCE_REQUEST_TYPE)
            ) {
                return;
            }
            if ((editingSegmentId !== index)) {
                paramComponents.push(
                    <ParamItem
                        param={{
                            id: index,
                            name: getParameterNameFromModel(param),
                            type: getParameterTypeFromModel(param),
                            option: param.source.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT
                        }}
                        readonly={editingSegmentId !== -1 || readonly}
                        onDelete={onDelete}
                        onEditClick={onEdit}
                    />
                );
            } else if (editingSegmentId === index) {
                paramComponents.push(
                    <ParamEditor
                        segmentId={index}
                        syntaxDiagnostics={syntaxDiag}
                        model={param}
                        completions={completions}
                        isEdit={true}
                        alternativeName={param.source.includes(RESOURCE_HEADER_PREFIX) ? "Identifier Name" : "Name"}
                        optionList={[PARAM_TYPES.DEFAULT, PARAM_TYPES.HEADER]}
                        option={param.source.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT}
                        isTypeReadOnly={false}
                        onChange={onParamChange}
                        onCancel={onParamEditCancel}
                    />
                )
            }
        });

    return (
        <div>
            {paramComponents}
            {(editingSegmentId === -1) && (
                <div>
                    <Button
                        data-test-id="param-add-button"
                        onClick={addParam}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon />}
                        color="primary"
                        disabled={readonly}
                    >
                        Add Parameter
                    </Button>
                </div>
            )}

        </div>
    );
}
