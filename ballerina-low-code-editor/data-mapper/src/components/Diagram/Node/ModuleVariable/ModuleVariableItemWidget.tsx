/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from "react";

import { IconButton } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperPortWidget, PortState, RecordFieldPortModel } from '../../Port';
import { getTypeName } from "../../utils/dm-utils";
import { RecordFieldTreeItemWidget } from "../commons/RecordTypeTreeWidget/RecordFieldTreeItemWidget";
import { TreeBody, TreeHeader } from '../commons/Tree/Tree';

import { useStyles } from "./style";

export interface ModuleVariableItemProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    typeDesc: Type;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
    valueLabel?: string;
}

export function ModuleVariableItemWidget(props: ModuleVariableItemProps) {
    const { engine, typeDesc, id, getPort, handleCollapse, valueLabel } = props;
    const classes = useStyles();

    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);

    const typeName = getTypeName(typeDesc);
    const portOut = getPort(`${id}.OUT`);
    const expanded = !(portOut && portOut.collapsed);
    const isRecord = typeDesc.typeName === PrimitiveBalType.Record;

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel}>
                {valueLabel ? valueLabel : id}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.typeLabel}>
                    {typeName}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
        handleCollapse(id, !expanded);
    };

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <>
            <TreeHeader
                id={"recordfield-" + id}
                isSelected={portState !== PortState.Unselected}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <span className={classes.label}>
                {isRecord && (
                    <IconButton
                        className={classes.expandIcon}
                        onClick={handleExpand}
                        data-testid={`${id}-expand-icon-record-source-node`}
                    >
                        {expanded ? <ExpandMoreIcon/> : <ChevronRightIcon/>}
                    </IconButton>
                )}
                    {label}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} handlePortState={handlePortState} />
                    }
                </span>
            </TreeHeader>
            {
                expanded && isRecord && (
                    <TreeBody>
                        {typeDesc.fields.map((field) => {
                            return (
                                <RecordFieldTreeItemWidget
                                    key={id}
                                    engine={engine}
                                    field={field}
                                    getPort={getPort}
                                    parentId={id}
                                    handleCollapse={handleCollapse}
                                    treeDepth={0}
                                    hasHoveredParent={isHovered}
                                />
                            );
                        })
                        }
                    </TreeBody>
                )
            }
        </>
    );
}
