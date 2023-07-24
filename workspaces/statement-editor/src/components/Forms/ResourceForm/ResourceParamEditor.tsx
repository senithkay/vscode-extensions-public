/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { Button } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { connectorStyles, TextPreloaderVertical } from '@wso2-enterprise/ballerina-low-code-edtior-ui-components';
import { STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";

import { Param, ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParameterConfig, ParamItem } from './ParamEditor/ParamItem';
import { ResourceParam } from './types';
import { genParamName, getParamString } from './util';

export interface QueryParamEditorProps {
    parameters: ResourceParam[];
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
    const [isNew, setIsNew] = useState(false);

    const paramNames: string[] = parameters.map(param => param.name);

    const onEdit = (param: Param) => {
        setEditingSegmentId(param.id);
        onChangeInProgress(true);
    };

    const onDelete = (param: ParameterConfig) => {
        const indexToRemove = param.id;
        if (indexToRemove >= 0 && indexToRemove < parameters.length) {
            parameters.splice(indexToRemove, 1);
            onChange(getParamString(parameters));
        }
    };

    const onParamChange = (segmentId: number, paramString: string, focusedModel?: STNode, changedValue?: string) => {
        const newParamString = parameters.reduce((prev, current, currentIndex) => {
            if (segmentId === currentIndex) {
                return prev !== "" ? `${prev},${paramString}` : `${paramString}`;
            }
            return prev !== "" ? `${prev},${current.parameterValue}` : `${current.parameterValue}`;
        }, '');
        onChange(newParamString);
    };

    const addParam = () => {
        let segmentId = parameters.length === 0 ? 0 : parameters.length;
        const lastParamIndex = parameters.findIndex(param =>
            STKindChecker.isRestParam(param.model) || STKindChecker.isDefaultableParam(param.model)
        );
        if (lastParamIndex > -1) {
            segmentId = lastParamIndex;
        }

        const paramName = genParamName('param', paramNames);

        const newObject: ResourceParam = {
            parameterValue: `string? ${paramName}`,
            diagnosticMsg: [],
            name: paramName,
            type: "string?",
            default: ""
        };

        // Insert the object at the specified index
        parameters.splice(segmentId, 0, newObject);

        onChange(getParamString(parameters));
        setEditingSegmentId(segmentId);
        setIsNew(true);
    };

    const onParamEditCancel = (id?: number) => {
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        if (id !== undefined && id >= 0 && isNew) {
            onDelete({ id, name: "" });
        }
        setIsNew(false);
    };


    let isEditingPram: boolean = false;
    const paramComponents: React.ReactElement[] = [];

    parameters
        .forEach((param, index) => {
            if ((editingSegmentId !== index)) {
                if (param.parameterValue.includes(RESOURCE_PAYLOAD_PREFIX)
                    || param.parameterValue.includes(RESOURCE_CALLER_TYPE)
                    || param.parameterValue.includes(RESOURCE_REQUEST_TYPE)
                    || param.parameterValue.includes(RESOURCE_HEADER_MAP_TYPE)
                ) {
                    return;
                }
                paramComponents.push(
                    <ParamItem
                        param={{
                            id: index,
                            name: param.name,
                            type: param.type,
                            option: param.parameterValue.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT,
                            defaultValue: param.default?.replace("=", "").trim()
                        }}
                        readonly={editingSegmentId !== -1 || readonly}
                        onDelete={onDelete}
                        onEditClick={onEdit}
                    />
                );
            } else if (editingSegmentId === index) {
                isEditingPram = true;
                paramComponents.push(
                    <ParamEditor
                        segmentId={index}
                        syntaxDiagnostics={syntaxDiag}
                        model={param}
                        completions={completions}
                        isEdit={true}
                        alternativeName={param.parameterValue.includes(RESOURCE_HEADER_PREFIX) ? "Identifier Name" : "Name"}
                        optionList={[PARAM_TYPES.DEFAULT, PARAM_TYPES.HEADER]}
                        option={param.parameterValue.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT}
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
            {(editingSegmentId !== -1) && !isEditingPram && (
                <div>
                    <TextPreloaderVertical position="fixedMargin" />
                </div>
            )}
        </div>
    );
}
