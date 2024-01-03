/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useState } from "react";

import { css } from "@emotion/css";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { PrimitiveBalType, Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import classnames from "classnames";

import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../../Port";
import { getBalRecFieldName, getOptionalRecordField, getTypeName } from "../../../utils/dm-utils";
import { InputSearchHighlight } from "../Search";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";

const useStyles = () => ({
    treeLabel: css({
        padding: "5px",
        minWidth: "100px",
        display: "flex",
        minHeight: "24px",
        '&:hover': {
            backgroundColor: 'var(--vscode-editorHoverWidget-statusBarBackground)',
        }
    }),
    treeLabelPortSelected: css({
        backgroundColor: 'var(--vscode-editorWidget-background)',
    }),
    treeLabelParentHovered: css({
        backgroundColor: 'var(--vscode-tab-inactiveBackground)',
    }),
    treeLabelOutPort: css({
        float: "right",
        width: 'fit-content',
        marginLeft: "auto",
        display: "flex",
        alignItems: "center"
    }),
    treeLabelInPort: css({
        float: "left",
        marginRight: "5px",
        width: 'fit-content',
        display: "flex",
        alignItems: "center"
    }),
    typeLabel: css({
        marginLeft: "3px",
        padding: "5px",
        minWidth: "100px",
        marginRight: "24px",
        fontWeight: 400,
        color: "inherit"
    }),
    valueLabel: css({
        padding: "5px",
        color: "inherit"
    }),
    group: css({
        marginLeft: "0px",
        paddingLeft: "0px",
        paddingBottom: "5px"
    }),
    content: css({
        borderTopRightRadius: "16px",
        borderBottomRightRadius: "16px",
        paddingRight: "16px",
    }),
    label: css({
        width: "300px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        textOverflow: "ellipsis",
        color: "var(--vscode-foreground)",
        "&:hover": {
            overflow: "visible"
        }
    }),
    expandIcon: css({
        color: "var(--vscode-inputOption-activeForeground)",
        height: "25px",
        width: "25px",
        marginLeft: "auto"
    })
});

export interface RecordFieldTreeItemWidgetProps {
    parentId: string;
    field: Type;
    engine: DiagramEngine;
    getPort: (portId: string) => RecordFieldPortModel;
    treeDepth?: number;
    handleCollapse: (portName: string, isExpanded?: boolean) => void;
    isOptional?: boolean;
    hasHoveredParent?: boolean;
}

export function RecordFieldTreeItemWidget(props: RecordFieldTreeItemWidgetProps) {
    const { parentId, field, getPort, engine, handleCollapse, treeDepth = 0, isOptional, hasHoveredParent } = props;
    const classes = useStyles();

    const fieldName = getBalRecFieldName(field.name);
    const fieldId = `${parentId}${isOptional ? `?.${fieldName}` : `.${fieldName}`}`;
    const portIn = getPort(`${fieldId}.IN`);
    const portOut = getPort(`${fieldId}.OUT`);
    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);

    let fields: Type[];
    let optional = false;

    const optionalRecordField = getOptionalRecordField(field);
    if (optionalRecordField) {
        optional = true
        fields = optionalRecordField.fields;
    } else if (field.typeName === PrimitiveBalType.Record) {
        fields = field.fields;
    }

    let expanded = true;
    if ((portIn && portIn.collapsed) || (portOut && portOut.collapsed)) {
        expanded = false;
    }

    const typeName = getTypeName(field);

    const indentation = fields ? 0 : ((treeDepth + 1) * 16) + 8;

    const label = (
        <span style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel} style={{ marginLeft: indentation }}>
                <InputSearchHighlight>{fieldName}</InputSearchHighlight>
                {field.optional && "?"}
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
        handleCollapse(fieldId, !expanded);
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
            <div
                id={"recordfield-" + fieldId}
                className={classnames(classes.treeLabel,
                    (portState !== PortState.Unselected) ? classes.treeLabelPortSelected : "",
                    hasHoveredParent ? classes.treeLabelParentHovered : ""
                )}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <span className={classes.treeLabelInPort}>
                    {portIn &&
                        <DataMapperPortWidget engine={engine} port={portIn} handlePortState={handlePortState} />
                    }
                </span>
                <span className={classes.label}>
                    {fields && <Button
                            appearance="icon"
                            tooltip="Expand/Collapse"
                            onClick={handleExpand}
                            sx={{ marginLeft: treeDepth * 16 }}
                        >
                            {expanded ? <Codicon name="chevron-right" /> : <Codicon name="chevron-down" />}
                        </Button>}
                    {label}
                </span>
                <span className={classes.treeLabelOutPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} handlePortState={handlePortState} />
                    }
                </span>
            </div>
            {fields && expanded &&
                fields.map((subField, index) => {
                    return (
                        <RecordFieldTreeItemWidget
                            key={index}
                            engine={engine}
                            field={subField}
                            getPort={getPort}
                            parentId={fieldId}
                            handleCollapse={handleCollapse}
                            treeDepth={treeDepth + 1}
                            isOptional={isOptional || optional}
                            hasHoveredParent={isHovered || hasHoveredParent}
                        />
                    );
                })
            }
        </>
    );
}
