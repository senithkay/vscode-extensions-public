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
import {
    dynamicConnectorStyles as connectorStyles,
    Param,
    ParamEditor,
    ParamItem,
    PARAM_TYPES
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { CommaToken, DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { StmtDiagnostic, SuggestionItem } from "../../../models/definitions";

import { QueryParam, QueryParamCollection } from "./types";
import {
    callerParameterOption,
    generateParameterSectionString,
    generateQueryStringFromQueryCollection, genParamName,
    getEnabledQueryParams,
    getParameterType,
    getQueryParamCollection,
    payloadParameterOption,
    queryParameterOption,
    recalculateItemIds, requestParameterOption
} from "./util";

export interface QueryParamEditorProps {
    parameters: (CommaToken | DefaultableParam | IncludedRecordParam | RequiredParam | RestParam)[];
    queryParamString: string;
    readonly?: boolean;
    syntaxDiag?: StmtDiagnostic[];
    nameSemDiag?: string;
    typeSemDiag?: string;
    onChange: (paramString: string, model?: STNode, avoidValueCommit?: boolean) => void,
    onChangeInProgress: (isInProgress: boolean) => void;
    completions: SuggestionItem[];
}

export function QueryParamEditor(props: QueryParamEditorProps) {
    const {
        parameters, syntaxDiag = null, nameSemDiag, typeSemDiag, readonly, onChangeInProgress,
        onChange, completions
    } = props;

    const connectorClasses = connectorStyles();
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingParam, setAddingParam] = useState<boolean>(false);
    const [typeReadOnly, setTypeReadOnly] = useState<boolean>(false);

    const payloadPosition: number = -1;
    const [paramOptions, setParamOptions] = useState(getEnabledQueryParams(generateParameterSectionString(parameters)));

    useEffect(() => {
        setParamOptions(getEnabledQueryParams(generateParameterSectionString(parameters)));
    }, [parameters])

    const onParamAdd = (param: Param, option: string) => {
        setEditingSegmentId(-1);
        const parameterString = parameters.map((paramSegment, index) => {
            if (index === param.id) {
                return (option === payloadParameterOption) ? `@http:Payload ${param.type}  ${param.name}`
                    : `${param.type} ${param.name}`;
            } else {
                return paramSegment.value ? paramSegment.value : paramSegment.source;
            }
        }).reduce((prev, current) => `${prev}${current}`);
        onChange(parameterString);
        onChangeInProgress(false);
    };

    const onEdit = (param: { id: number, name: string, dataType?: string, option?: string }) => {
        const { id, option } = param;
        setEditingSegmentId(id);
    };

    const onDelete = (param: { id: number, name: string, dataType?: string, option?: string }) => {
        if (parameters.length - 1 > param.id) {
            parameters.splice(param.id, 2)
        } else {
            parameters.splice(param.id, 1)
        }
        onChange(generateParameterSectionString(parameters));
        onChangeInProgress(true);
    };

    const onParamChange = (
        param: Param,
        option?: string,
        optionChanged?: boolean,
        stModel?: STNode
    ) => {
        if (optionChanged) {
            if (option === payloadParameterOption) {
                param.type = `@http:Payload json`;
                setTypeReadOnly(false);
            } else if (option === requestParameterOption) {
                param.type = `http:Request`;
                setTypeReadOnly(true);
            } else if (option === callerParameterOption) {
                param.type = `http:Request`
                setTypeReadOnly(true);
            } else {
                param.type = `string`
                setTypeReadOnly(false);
            }
        }

        const parameterString = parameters.map((paramSegment, index) => {
            if (index === param.id) {
                return `${param.type} ${param.name}`;
            } else {
                return paramSegment.value ? paramSegment.value : paramSegment.source;
            }
        }).reduce((prev, current) => `${prev}${current}`);
        onChange(parameterString, stModel);
        onChangeInProgress(true);
    };

    const addParam = () => {
        setEditingSegmentId(parameters.length === 0 ? 0 : parameters.length + 1);
        onChange(generateParameterSectionString(parameters) + `${parameters.length > 0 ? ',' : ''} string ${genParamName("param", paramNames)}`);
        setAddingParam(true);
        setTypeReadOnly(false);
        onChangeInProgress(true);
    };

    const onParamEditCancel = () => {
        setAddingParam(false);
        setEditingSegmentId(-1);
        setTypeReadOnly(false);
        onChangeInProgress(false);
        onChange(generateParameterSectionString(parameters));
    };

    const paramNames: string[] = [];
    const pathComponents: React.ReactElement[] = parameters
        .map((param, index) => {
            if (editingSegmentId === index) {
                return (
                    <div>
                        {/* This place renders the edit component */}
                        <ParamEditor
                            completions={completions}
                            paramIndex={index}
                            model={param as any}
                            onSave={onParamAdd}
                            onChange={onParamChange}
                            onCancel={onParamEditCancel}
                            optionList={Object.values(PARAM_TYPES)}
                            enabledOptions={paramOptions}
                            option={getParameterType(param.source)}
                        />
                    </div>
                )
            }

            if (STKindChecker.isDefaultableParam(param) || STKindChecker.isRequiredParam(param)
                || STKindChecker.isIncludedRecordParam(param)) {

                return (
                    <ParamItem
                        param={{
                            id: index,
                            name: param.paramName.value,
                            type: param.typeName.source,
                            option: getParameterType(param.source)
                        }}
                        readonly={editingSegmentId !== -1 || readonly || addingParam}
                        onDelete={onDelete}
                        onEditClick={onEdit}
                    />
                );
            }
        });

    return (
        <div>
            {pathComponents}
            {!addingParam && (editingSegmentId === -1) && (
                <div>
                    <Button
                        data-test-id="param-add-button"
                        onClick={addParam}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon />}
                        color="primary"
                        disabled={(syntaxDiag !== null) || readonly}
                    >
                        Add parameter
                    </Button>
                </div>
            )}

        </div>
    );
}
