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

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import {
    dynamicConnectorStyles as connectorStyles,
    ParamEditor,
    ParamItem
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { StmtDiagnostic } from "../../../models/definitions";

import { QueryParam, QueryParamCollection } from "./types";
import {
    generateQueryStringFromQueryCollection,
    genParamName,
    getQueryParamCollection, headerParameterOption, paramOptions,
    queryParameterOption,
    recalculateItemIds,
} from "./util";

export interface QueryParamEditorProps {
    resourceParamString: string;
    readonly?: boolean;
    syntaxDiag?: StmtDiagnostic[];
    nameSemDiag?: string;
    typeSemDiag?: string;
    onChange: (paramString: string, avoidValueCommit?: boolean) => void,
    onChangeInProgress: (isInProgress: boolean) => void;
}

export function ResourceParamEditor(props: QueryParamEditorProps) {
    const { resourceParamString, syntaxDiag = null, nameSemDiag, typeSemDiag, readonly, onChangeInProgress,
            onChange } = props;

    const connectorClasses = connectorStyles();

    const queryParamCollection = getQueryParamCollection(resourceParamString);

    // editingSegmentId > -1 when editing and -1 when no edit in progress
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingParam, setAddingParam] = useState<boolean>(false);
    const [queryParamState, setQueryParamState] = useState<QueryParamCollection>(queryParamCollection);
    const [draftParam, setDraftParam] = useState<QueryParam>(undefined);

    const onParamAdd = (param : {id: number, name: string, dataType?: string, defaultValue?: string},
                        option: string) => {
        const { id, name, dataType, defaultValue } = param;
        // const type = (option === headerParameterOption) ? `@http:Header ${dataType}` : dataType;
        queryParamState.queryParams.push({id, name, type: dataType, option, defaultValue});
        setQueryParamState(queryParamState);
        setAddingParam(false);
        setDraftParam(undefined);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        onChange(generateQueryStringFromQueryCollection(queryParamState));
    };
    const onParamUpdate = (param : {id: number, name: string, dataType?: string, defaultValue?: string},
                           option: string) => {
        const { id, name, dataType, defaultValue } = param;
        // const type = (option === headerParameterOption) ? `@http:Header ${dataType}` : dataType;
        const clonePath = { ...queryParamState }
        const foundPath = queryParamState.queryParams.find(qParam => qParam.id === id);
        if (foundPath) {
            clonePath.queryParams[id] = {id, name, type: dataType, option, defaultValue};
        }
        setQueryParamState(clonePath);
        setAddingParam(false);
        setDraftParam(undefined);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        onChange(generateQueryStringFromQueryCollection(queryParamState));
    };

    const onEdit = (param : {id: number, name: string, headerName?: string, defaultValue?: string, dataType?: string,
                             option?: string}) => {
        const { id, option } = param;
        const foundPath = queryParamState.queryParams.find(qParam => qParam.id === id);
        if (foundPath) {
            setEditingSegmentId(id);
        }
        setAddingParam(false);
        setDraftParam(undefined);
        onChangeInProgress(true);
    };

    const onDelete = (param : {id: number, name: string, headerName?: string, defaultValue?: string, dataType?: string,
                               option?: string}) => {
        const { id } = param;
        const foundPath = queryParamState.queryParams.find(qParam => qParam.id === id);
        if (foundPath) {
            const pathClone = { ...queryParamState };
            pathClone.queryParams.splice(id, 1);
            recalculateItemIds(pathClone.queryParams);
            setQueryParamState(pathClone);
        }
        setAddingParam(false);
        setDraftParam(undefined);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        onChange(generateQueryStringFromQueryCollection(queryParamState));
    };

    const onParamChange = (param : {id: number, name: string, dataType: string, headerName: string,
                                    defaultValue?: string},
                           option?: string, optionChanged?: boolean) => {
        const { id, name, dataType, headerName, defaultValue } = param;
        const foundParam = queryParamState.queryParams.find(qParam => qParam.id === id);
        if (foundParam) {
            // When we have are editing an existing param
            let newParam;
            // if (optionChanged) {
            //     newParam = (option === headerParameterOption) ? {id, name, type: `@http:Header string`, option} :
            //         {id, name, type: `string`, option};
            // } else {
            //     newParam = (option === headerParameterOption) ?
            //         {id, name, type: `@http:Header ${dataType}`, option} : {id, name, type: dataType, option};
            // }
            newParam = optionChanged ? {id, name, type: `string`, option} :
                {id, name, type: dataType, option, defaultValue};
            setEditingSegmentId(id);
            setDraftParam(newParam);
            const clonedParamState: QueryParamCollection = { queryParams : [...queryParamState.queryParams] };
            clonedParamState.queryParams[id] = newParam;
            onChange(generateQueryStringFromQueryCollection(clonedParamState), true);
        } else {
            // When we have are editing a new param
            const newParam = {id, name, type: dataType, option, defaultValue};
            // if (optionChanged) {
            //     if (option === headerParameterOption) {
            //         newParam = {id, name, type: `@http:Payload json`, option};
            //     } else {
            //         newParam = {id, name, type: `string`, option};
            //     }
            // } else {
            //     newParam = (option === payloadParameterOption) ?
            //         {id, name, type: `@http:Payload ${dataType}`, option} : {id, name, type: dataType, option};
            // }
            setDraftParam(newParam);
            const newParams = [...queryParamState.queryParams, newParam];
            const clonedParamState: QueryParamCollection = {queryParams: newParams};
            onChange(generateQueryStringFromQueryCollection(clonedParamState), true);
        }
        onChangeInProgress(true);
    };

    const addParam = () => {
        setDraftParam({
            id: queryParamState.queryParams.length,
            name: genParamName("param", paramNames), type: "string",
            option: queryParameterOption
        });
        setAddingParam(true);
        onChangeInProgress(true);
    };

    const cancelAddParam = () => {
        setAddingParam(false);
        setDraftParam(undefined);
        setEditingSegmentId(-1);
        onChangeInProgress(false);
        onChange(resourceParamString);
    };

    const paramNames: string[] = [];
    const pathComponents: React.ReactElement[] = [];
    queryParamState.queryParams.forEach((value, index) => {
        if ((editingSegmentId !== index) && value.name) {
            pathComponents.push(
                <ParamItem
                    param={{
                        id: index, name: value.name, type: value.type, option: value.option
                    }}
                    readonly={editingSegmentId !== -1 || readonly || addingParam}
                    onDelete={onDelete}
                    onEditClick={onEdit}
                />
            );
        } else if (editingSegmentId === index) {
            let type;
            let name;
            if (draftParam) {
                if (draftParam.type.includes("@http:Payload")) {
                    const typeSplit = draftParam.type.split(" ");
                    type = typeSplit[1].trim();
                } else {
                    type = draftParam.type;
                }
                name = draftParam.name;
            } else {
                if (value.type.includes("@http:Payload")) {
                    const typeSplit = value.type.split(" ");
                    type = typeSplit[1].trim();
                } else {
                    type = value.type;
                }
                name = value.name;
            }
            pathComponents.push(
                <ParamEditor
                    syntaxDiag={syntaxDiag ? syntaxDiag[0].message : ""}
                    nameDiagnostics={nameSemDiag}
                    typeDiagnostics={typeSemDiag}
                    param={{id: value.id, name, dataType: type}}
                    isEdit={true}
                    optionList={paramOptions}
                    enabledOptions={paramOptions}
                    dataTypeReqOptions={paramOptions}
                    option={value.option}
                    isTypeReadOnly={false}
                    onChange={onParamChange}
                    onUpdate={onParamUpdate}
                    onCancel={cancelAddParam}
                />
            )
        }
        paramNames.push(value.name);
    });

    let addingParamType;
    if (draftParam?.type.includes("@http:Payload")) {
        const typeSplit = draftParam.type.split(" ");
        addingParamType = typeSplit[1].trim();
    } else {
        addingParamType = draftParam?.type;
    }

    useEffect(() => {
        setQueryParamState(getQueryParamCollection(resourceParamString));
    }, [resourceParamString]);

    return (
        <div>
            {pathComponents}
            {addingParam && (
                <ParamEditor
                    param={{id: draftParam.id, dataType: addingParamType, name: draftParam.name}}
                    nameDiagnostics={nameSemDiag}
                    typeDiagnostics={typeSemDiag}
                    syntaxDiag={syntaxDiag ? syntaxDiag[0].message : ""}
                    optionList={paramOptions}
                    enabledOptions={paramOptions}
                    dataTypeReqOptions={paramOptions}
                    isEdit={false}
                    isTypeReadOnly={false}
                    option={queryParameterOption}
                    onChange={onParamChange}
                    onAdd={onParamAdd}
                    onCancel={cancelAddParam}
                />
            )}
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
