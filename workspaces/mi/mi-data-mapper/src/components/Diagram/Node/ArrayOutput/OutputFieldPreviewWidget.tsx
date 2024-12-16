/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import classnames from "classnames";

import { DataMapperPortWidget, PortState, InputOutputPortModel } from "../../Port";
import { OutputSearchHighlight } from "../commons/Search";
import { useIONodesStyles } from "../../../styles";
import { useDMCollapsedFieldsStore } from '../../../../store/store';
import { getTypeName } from "../../utils/common-utils";


export interface OutputFieldPreviewWidgetProps {
    parentId: string;
    dmType: DMType;
    engine: DiagramEngine;
    getPort: (portId: string) => InputOutputPortModel;
    treeDepth?: number;
    hasHoveredParent?: boolean;
}

export function OutputFieldPreviewWidget(props: OutputFieldPreviewWidgetProps) {
    const { parentId, dmType, getPort, engine, treeDepth = 0, hasHoveredParent } = props;

    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);
    const collapsedFieldsStore = useDMCollapsedFieldsStore();

    const fieldName = dmType.fieldName;
    const typeName = getTypeName(dmType);
    const fieldId = `${parentId}.${fieldName}`;
    const portIn = getPort(fieldId + ".IN");

    const classes = useIONodesStyles();

    let fields: DMType[];

    if (dmType.kind === TypeKind.Interface) {
        fields = dmType.fields;
    } else if (dmType.kind === TypeKind.Array) {
        fields = [{...dmType.memberType, fieldName: `<${dmType.fieldName}Item>`}];
    }

    let expanded = true;

    if (portIn && portIn.collapsed) {
        expanded = false;
    }

    const indentation = fields ? 0 : ((treeDepth + 1) * 16) + 8;

    const label = (
        <span style={{ marginRight: "auto", opacity: 0.5  }}>
            <span className={classes.valueLabel} style={{ marginLeft: indentation }}>
                <OutputSearchHighlight>{fieldName}</OutputSearchHighlight>
                {!dmType.optional && <span className={classes.requiredMark}>*</span>}
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.inputTypeLabel}>
                    {typeName}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
        if (!expanded) {
            collapsedFieldsStore.expandField(fieldId, dmType.kind);
        } else {
            collapsedFieldsStore.collapseField(fieldId, dmType.kind);
        }
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
                title={"Please map parent field first"}
            >
                <span className={classes.label}>
                    {fields && <Button
                        id={"expand-or-collapse-" + fieldId}
                        appearance="icon"
                        tooltip="Expand/Collapse"
                        onClick={handleExpand}
                        sx={{ marginLeft: treeDepth * 16 }}
                    >
                        {expanded ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
                    </Button>}
                    {label}
                </span>
            </div>
            {fields && expanded &&
                fields.map((subField, index) => {
                    return (
                        <OutputFieldPreviewWidget
                            key={index}
                            engine={engine}
                            dmType={subField}
                            getPort={getPort}
                            parentId={fieldId}
                            treeDepth={treeDepth + 1}
                            hasHoveredParent={isHovered || hasHoveredParent}
                        />
                    );
                })
            }
        </>
    );
}
