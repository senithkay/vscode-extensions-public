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

import React, {useEffect, useState} from 'react';

import { Button } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import {
    dynamicConnectorStyles as connectorStyles,
    ParamEditor,
    ParamItem
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import { useStyles } from "./styles";
import { Path, PathSegment } from "./types";
import { convertPathStringToSegments } from "./util";
const pathParameterOption = "Path Parameter";
const pathSegmentOption = "Param Segment";

export interface PathEditorProps {
    relativeResourcePath: string;
    onSave: () => void,
    onCancel: string;
}

export function PathEditor(props: PathEditorProps) {
    const { relativeResourcePath } = props;
    const options = [pathSegmentOption, pathParameterOption];

    const connectorClasses = connectorStyles();
    const classes = useStyles();

    const path: Path = convertPathStringToSegments(relativeResourcePath);

    // editingSegmentId > -1 when editing and -1 when no edit in progress
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingParam, setAddingParam] = useState<boolean>(false);
    const [pathState, setPathState] = useState<Path>(path);
    const [draftPath, setDraftPath] = useState<PathSegment>(undefined);

    const onPathAdd = (param : {id: number, name: string, dataType?: string}, option: string) => {
        const { id, name, dataType } = param;
        pathState.segments.push({id, name, type: dataType, isParam: option === pathParameterOption});
        setPathState(pathState);
        setAddingParam(false);
        setDraftPath(undefined);
        setEditingSegmentId(-1);
    };
    const onPathUpdate = (param : {id: number, name: string, dataType?: string}, option: string) => {
        const { id, name, dataType } = param;
        const clonePath = { ...pathState }
        const foundPath = pathState.segments.find(segment => segment.id === id);
        if (foundPath) {
            setEditingSegmentId(id);
            clonePath.segments[id] = {id, name, type: dataType, isParam: option === pathParameterOption};
        }
        setPathState(clonePath);
        setAddingParam(false);
        setDraftPath(undefined);
        setEditingSegmentId(-1);
    };

    const onEdit = (param : {id: number, name: string, dataType?: string, option?: string}) => {
        const { id } = param;
        const foundPath = pathState.segments.find(segment => segment.id === id);
        // Once edit is clicked
        if (foundPath) {
            setEditingSegmentId(id);
        }
        setAddingParam(false);
        setDraftPath(undefined);
    };
    const onPathChange = (param : {id: number, name: string, dataType: string}, option?: string,
                          optionChanged?: boolean) => {
        const { id, name, dataType } = param;
        const foundPath = pathState.segments.find(segment => segment.id === id);
        const isParam = (option === pathParameterOption);
        if (foundPath) {
            // When we have are editing an existing param
            const newPath = optionChanged ? (isParam ? {id, name: "name", type: "string", isParam} :
                    {id, name: "name", isParam}) : {id, name, type: dataType, isParam};
            setEditingSegmentId(id);
            setDraftPath(newPath);
        } else {
            // When we have are editing a new param
            const newPath = optionChanged ? (isParam ? {id, name: "name", type: "string", isParam} :
                {id, name: "name", isParam}) : {id, name, type: dataType, isParam};
            setDraftPath(newPath);
        }
    };

    const addPath = () => {
        setDraftPath({id: pathState.segments.length, name: "name", type: "string", isParam: false});
        setAddingParam(true);
    };

    const cancelAddPath = () => {
        setAddingParam(false);
        setDraftPath(undefined);
        setEditingSegmentId(-1);
    };

    const pathComponents: React.ReactElement[] = [];
    pathState.segments.forEach((value, index) => {
        if (value.name) {
            if (editingSegmentId !== index) {
                pathComponents.push(
                    <ParamItem
                        param={{id: index, name: value.name, type: value.type, option:
                                value.isParam ? pathParameterOption : pathSegmentOption}}
                        addInProgress={editingSegmentId === -1}
                        onDelete={null}
                        onEditClick={onEdit}
                    />
                );
            } else if (editingSegmentId === index) {
                const param = draftPath ? {id: draftPath.id, dataType: draftPath.type, name: draftPath.name} :
                    {id: value.id, dataType: value.type, name: value.name}
                pathComponents.push(
                    <ParamEditor
                        param={param}
                        optionList={options}
                        option={value.isParam ? pathParameterOption : pathSegmentOption}
                        onChange={onPathChange}
                        onUpdate={onPathUpdate}
                        onCancel={cancelAddPath}
                    />
                )
            }
        }
    });

    useEffect(() => {
        setPathState(convertPathStringToSegments(relativeResourcePath));
    }, [relativeResourcePath]);

    return (
        <div>
            {pathComponents}
            {addingParam && (
                <ParamEditor
                    param={{id: draftPath.id, dataType: draftPath.type, name: draftPath.name}}
                    optionList={options}
                    onChange={onPathChange}
                    onAdd={onPathAdd}
                    onCancel={cancelAddPath}
                />
            )}
            {!addingParam && (editingSegmentId === -1) && (
                <div>
                    <Button
                        data-test-id="param-add-button"
                        onClick={addPath}
                        className={connectorClasses.addParameterBtn}
                        startIcon={<AddIcon />}
                        color="primary"
                        // disabled={currentComponentSyntaxDiag?.length > 0}
                    >
                        Add parameter
                    </Button>
                </div>
            )}

        </div>
    );
}
