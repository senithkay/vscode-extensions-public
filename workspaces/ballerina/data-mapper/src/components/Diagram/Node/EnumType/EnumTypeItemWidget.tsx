/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { IconButton } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import classNames from "classnames";

import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../Port";
import { getTypeName } from "../../utils/dm-utils";
import { InputSearchHighlight } from "../commons/Search";

import { DMEnumTypeDecl } from "./EnumTypeNode";
import { useStyles } from "./styles";

export interface EnumTypeItemWidgetProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    enumType: DMEnumTypeDecl;
    engine: DiagramEngine;
    treeDepth?: number;
    getPort: (portId: string) => RecordFieldPortModel;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
    valueLabel?: string;
    hasHoveredParent?: boolean;
}

export function EnumTypeItemWidget(props: EnumTypeItemWidgetProps) {
    const {
        engine,
        enumType,
        id,
        treeDepth = 0,
        getPort,
        handleCollapse,
        valueLabel,
        hasHoveredParent,
    } = props;
    const classes = useStyles();

    const [portState, setPortState] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);

    const typeName = getTypeName(enumType.type);
    const portOut = getPort(`${id}.OUT`);
    const expanded = !(portOut && portOut.collapsed);
    const hasFields = !!enumType?.fields?.length;

    const indentation = hasFields ? 0 : (treeDepth + 1) * 16 + 8;
    const isHeader = treeDepth === 0;

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel} style={{ marginLeft: indentation }}>
                <InputSearchHighlight>{valueLabel}</InputSearchHighlight>
                {typeName && ":"}
            </span>
            {typeName && <span className={classes.typeLabel}>{typeName}</span>}
        </span>
    );

    const handleExpand = () => {
        handleCollapse(id, !expanded);
    };

    const handlePortState = (state: PortState) => {
        setPortState(state);
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <>
            <div
                id={"recordfield-" + id}
                className={classNames(
                    isHeader ? classes.headerTreeLabel : classes.treeLabel,
                    portState !== PortState.Unselected ? classes.treeLabelPortSelected : "",
                    hasHoveredParent ? classes.treeLabelParentHovered : ""
                )}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <span className={classes.label}>
                    {hasFields && (
                        <IconButton
                            id={"button-wrapper-" + id}
                            className={classes.expandIcon}
                            style={{ marginLeft: treeDepth * 16 }}
                            onClick={handleExpand}
                        >
                            {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    )}
                    {label}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut && (
                        <DataMapperPortWidget
                            engine={engine}
                            port={portOut}
                            handlePortState={handlePortState}
                        />
                    )}
                </span>
            </div>
            {hasFields &&
                expanded &&
                enumType.fields.map((subField) => {
                    return (
                        <EnumTypeItemWidget
                            key={`${id}.${subField.varName}`}
                            id={`${id}.${subField.varName}`}
                            engine={engine}
                            enumType={subField}
                            treeDepth={treeDepth + 1}
                            getPort={getPort}
                            handleCollapse={handleCollapse}
                            valueLabel={subField.varName}
                            hasHoveredParent={isHovered || hasHoveredParent}
                        />
                    );
                })}
        </>
    );
}
