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
import {
    CommaToken, DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode
} from '@wso2-enterprise/syntax-tree';

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";

import { Param, ParamEditor, PARAM_TYPES } from './ParamEditor/ParamEditor';
import { ParamItem } from './ParamEditor/ParamItem';
import { QueryParam } from "./types";
import { genParamName, getParamString } from './util';

export interface QueryParamEditorProps {
    parameters: (CommaToken | DefaultableParam | RequiredParam | IncludedRecordParam | RestParam)[];
    completions: SuggestionItem[];
    onChange: (paramString: string, model?: STNode, avoidValueCommit?: boolean) => void,
    onChangeInProgress: (isInProgress: boolean) => void; // not sure why?
    syntaxDiag?: StatementSyntaxDiagnostics[];
    readonly?: boolean;
    // useless:
    resourceParamString: string;
    nameSemDiag?: string;
    typeSemDiag?: string;
}

export const RESOURCE_PAYLOAD_PREFIX = "@http:Payload";
export const RESOURCE_HEADER_PREFIX = "@http:Header";
export const RESOURCE_REQUEST_TYPE = "http:Request";
export const RESOURCE_CALLER_TYPE = "http:Caller";
export const RESOURCE_HEADER_MAP_TYPE = "http:Headers";

export function ResourceParamEditor(props: QueryParamEditorProps) {
    const { parameters, completions, onChange, onChangeInProgress, syntaxDiag, readonly } = props;
    const connectorClasses = connectorStyles();

    console.log('parameters >>>', parameters);
    // const queryParamCollection = getQueryParamCollection(resourceParamString);

    // editingSegmentId > -1 when editing and -1 when no edit in progress
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingParam, setAddingParam] = useState<boolean>(false);
    // const [queryParamState, setQueryParamState] = useState<QueryParamCollection>(queryParamCollection);
    const [draftParam, setDraftParam] = useState<QueryParam>(undefined);

    const onParamAdd = (
        param: Param,
        option: string
    ) => {
        // const { id, name, dataType, defaultValue } = param;
        // queryParamState.queryParams.push({ id, name, type: dataType, option, defaultValue });
        // setQueryParamState(queryParamState);
        setAddingParam(false);
        setDraftParam(undefined);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        // onChange(generateQueryStringFromQueryCollection(queryParamState));
    };

    const onParamUpdate = (
        param: Param,
        option: string
    ) => {
        const { id, name, dataType, defaultValue, headerName } = param;
        // const clonePath = { ...queryParamState }
        // const foundPath = queryParamState.queryParams.find(qParam => qParam.id === id);
        // if (foundPath) {
        //     clonePath.queryParams[id] = { id, name, type: dataType, option, defaultValue, mappedName: headerName };
        // }
        // setQueryParamState(clonePath);
        setAddingParam(false);
        setDraftParam(undefined);
        setEditingSegmentId(-1);
        // const parameterString = parameters.map((paramSegment, index) => {
        //     if (index === param.id) {
        //         return (option === payloadParameterOption) ? `@http:Payload ${param.type}  ${param.name}`
        //             : `${param.type} ${param.name}`;
        //     } else {
        //         return paramSegment.value ? paramSegment.value : paramSegment.source;
        //     }
        // }).reduce((prev, current) => `${prev}${current}`);
        // onChange(parameterString);
        onChangeInProgress(false);
    };

    const onEdit = (param: Param) => {
        setEditingSegmentId(param.id);
        setAddingParam(false);
        setDraftParam(undefined);
        onChangeInProgress(true);
    };

    const onDelete = (param: {
        id: number, name: string, headerName?: string, defaultValue?: string, dataType?: string,
        option?: string
    }) => {
        const { id } = param;
        // const foundPath = queryParamState.queryParams.find(qParam => qParam.id === id);
        // if (foundPath) {
        //     const pathClone = { ...queryParamState };
        //     pathClone.queryParams.splice(id, 1);
        //     recalculateItemIds(pathClone.queryParams);
        //     setQueryParamState(pathClone);
        // }
        // setAddingParam(false);
        // setDraftParam(undefined);
        // setEditingSegmentId(-1);
        // onChangeInProgress(false);
        // onChange(generateQueryStringFromQueryCollection(queryParamState));
    };

    const onParamChange = (segmentId: number, paramString: string) => {
        // const { id, name, dataType, headerName, defaultValue } = param;

        const newParamString = parameters.reduce((prev, current, currentIndex) => {
            if (segmentId === currentIndex) {
                return `${prev} ${paramString}`;
            }

            return `${prev}${current.source ? current.source : current.value}`;
        }, '');

        onChange(newParamString);
        // const foundParam = queryParamState.queryParams.find(qParam => qParam.id === id);
        // if (foundParam) {
        //     // When we are editing an existing param
        //     const newParam = optionChanged ? {
        //         id, name, type: `string?`, option, mappedName: headerName, defaultValue:
        //             isFinalParamContainValue ? '""' : defaultValue
        //     } : {
        //         id, name, type: dataType, option, defaultValue,
        //         mappedName: headerName
        //     }
        //     setEditingSegmentId(id);
        //     setDraftParam(newParam);
        //     const clonedParamState: QueryParamCollection = { queryParams: [...queryParamState.queryParams] };
        //     clonedParamState.queryParams[id] = newParam;
        //     // onChange(generateQueryStringFromQueryCollection(clonedParamState), true);
        // } else {
        //     // When we are editing a new param
        //     const newParam = optionChanged ? {
        //         id, name, type: `string?`, option, mappedName: headerName, defaultValue:
        //             isFinalParamContainValue ? '""' : defaultValue
        //     } :
        //         { id, name, type: dataType, option, defaultValue, mappedName: headerName };
        //     setDraftParam(newParam);
        //     const newParams = [...queryParamState.queryParams, newParam];
        //     const clonedParamState: QueryParamCollection = { queryParams: newParams };
        // onChange(generateQueryStringFromQueryCollection(clonedParamState), true);
        // }
        // onChangeInProgress(true);
    };



    const addParam = () => {
        let newParamString;
        let segmentId = parameters.length + 1;
        const lastParamIndex = parameters.findIndex(param => STKindChecker.isRestParam(param) || STKindChecker.isDefaultableParam(param));
        if (lastParamIndex === -1) {
            newParamString = `${getParamString(parameters)}${parameters.length === 0 ? '' : ','} string ${genParamName('param', paramNames)}`;
        } else {
            newParamString = parameters.reduce((prev, current, currentIndex) => {
                let returnString = prev;
                if (currentIndex === lastParamIndex) {
                    returnString = `${returnString} string ${genParamName('param', paramNames)},`
                    segmentId = currentIndex;
                }

                returnString = `${returnString}${current.source ? current.source : current.value}`
                return returnString;
            }, '');
        }

        onChange(newParamString);
        setEditingSegmentId(segmentId);
        setAddingParam(true);
        onChangeInProgress(true);
    };

    const onParamEditCancel = () => {
        setAddingParam(false);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        // onChange(resourceParamString);
    };

    const getParameterName = (param: (CommaToken | RequiredParam | RestParam | IncludedRecordParam | DefaultableParam)): string => {
        if (STKindChecker.isRequiredParam(param) || STKindChecker.isDefaultableParam(param) ||
            STKindChecker.isIncludedRecordParam(param) || STKindChecker.isRestParam(param)) {
            return param.paramName.value
        }

        return '';
    }

    const getParameterType = (param: (CommaToken | RequiredParam | RestParam | IncludedRecordParam | DefaultableParam)): string => {
        if (STKindChecker.isRequiredParam(param) || STKindChecker.isDefaultableParam(param) ||
            STKindChecker.isIncludedRecordParam(param) || STKindChecker.isRestParam(param)) {
            return param.typeName.source;
        }

        return '';
    }

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
                            name: getParameterName(param),
                            type: getParameterType(param),
                            option: param.source.includes(RESOURCE_HEADER_PREFIX) ? PARAM_TYPES.HEADER : PARAM_TYPES.DEFAULT
                        }}
                        readonly={editingSegmentId !== -1 || readonly || addingParam}
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

    let addingParamType;
    if (draftParam?.type.includes("@http:Payload")) {
        const typeSplit = draftParam.type.split(" ");
        addingParamType = typeSplit[1].trim();
    } else {
        addingParamType = draftParam?.type;
    }

    return (
        <div>
            {paramComponents}
            {/* {addingParam && (
                <ParamEditor
                    param={{
                        id: draftParam.id, dataType: addingParamType, name: draftParam.name,
                        defaultValue: draftParam.defaultValue
                    }}
                    nameDiagnostics={nameSemDiag}
                    typeDiagnostics={typeSemDiag}
                    syntaxDiag={syntaxDiag ? syntaxDiag[0].message : ""}
                    optionList={paramOptions}
                    enabledOptions={paramOptions}
                    dataTypeReqOptions={paramOptions}
                    alternativeName={draftParam.option === headerParameterOption ? "Identifier Name" : "Name"}
                    isEdit={false}
                    isTypeReadOnly={false}
                    option={queryParameterOption}
                    onChange={onParamChange}
                    onAdd={onParamAdd}
                    onCancel={cancelAddParam}
                />
            )} */}
            {!addingParam && (editingSegmentId === -1) && (
                <div>
                    <Button
                        data-test-id="param-add-button"
                        onClick={addParam}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon />}
                        color="primary"
                        disabled={false}
                    >
                        Add Parameter
                    </Button>
                </div>
            )}

        </div>
    );
}
