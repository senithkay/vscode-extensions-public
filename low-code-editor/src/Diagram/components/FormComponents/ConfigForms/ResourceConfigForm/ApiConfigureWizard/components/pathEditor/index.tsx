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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { AddIcon } from "../../../../../../../../assets/icons";
import { keywords } from "../../../../../../Portals/utils/constants";
import { Path, PathSegment } from "../../types";
import { convertPathStringToSegments, genrateBallerinaResourcePath, recalculateItemIds } from "../../util";

import { PathSegmentItem } from "./pathSegement";
import { PathSegmentEditor } from "./segmentEditor";
import { useStyles } from './style';

interface PathEditorProps {
    pathString: string;
    defaultValue?: string;
    onChange?: (text: string) => void;
    model?: STNode;
    targetPosition?: NodePosition;
}

export function PathEditor(props: PathEditorProps) {
    const { pathString, onChange, model, targetPosition } = props;
    const path: Path = convertPathStringToSegments(pathString);
    const classes = useStyles();

    const [pathState, setPathState] = useState<Path>(path);
    const [addingSegment, setAddingSegment] = useState<boolean>(false);

    const onDelete = (segment: PathSegment) => {
        const id = segment.id;
        if (id > -1) {
            const pathClone: Path = {
                segments: pathState.segments
            };
            pathClone.segments.splice(id, 1);
            recalculateItemIds(pathClone.segments);
            setPathState(pathClone);
            if (onChange) {
                onChange(genrateBallerinaResourcePath(pathClone));
            }
        }
    };

    const pathSegements: React.ReactElement[] = [];
    pathState.segments.forEach((value, index) => {
        if (value.name) {
            pathSegements.push(<PathSegmentItem segment={value} onDelete={onDelete} />);
        }
    });

    const onSave = (pathSegment: PathSegment) => {
        if (keywords.includes(pathSegment.name)) {
            pathSegment.name = "'" + pathSegment.name;
        }
        pathState.segments.push(pathSegment);
        setPathState(pathState);
        setAddingSegment(!addingSegment);
        if (onChange) {
            onChange(genrateBallerinaResourcePath(pathState));
        }
    };

    const onCancel = () => {
        setAddingSegment(!addingSegment);
    };

    const addPathBtn = () => {
        setAddingSegment(!addingSegment);
    }

    const pathSegmentEditor = (
        <div>
            <PathSegmentEditor
                id={pathState.segments.length}
                onCancel={onCancel}
                onSave={onSave}
                model={model}
                targetPosition={targetPosition}
            />
        </div>
    );

    const addPathBtnUI = (
        <div id="">
            <button
                onClick={addPathBtn}
                className={classes.addPathBtn}
            >
                <div className={classes.addPathBtnWrap}>
                    <AddIcon />
                    <p><FormattedMessage id="lowcode.develop.apiConfigWizard.addPathSegment.title" defaultMessage="Add Path Segment" /></p>
                </div>
            </button>
        </div>
    );

    return (
        <div>
            <div id="listOfPaths" >
                {pathSegements}
            </div>
            {addingSegment && pathSegmentEditor}
            {!addingSegment && addPathBtnUI}
        </div>
    );
}
