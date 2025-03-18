/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { Button, Codicon, TruncatedLabel } from "@wso2-enterprise/ui-toolkit";
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams';
import { DMType, IOType, TypeKind } from "@wso2-enterprise/mi-core";

import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { InputSearchHighlight } from '../commons/Search';
import { TreeBody, TreeContainer, TreeHeader } from '../commons/Tree/Tree';
import { InputNodeTreeItemWidget } from "./InputNodeTreeItemWidget";
import { useIONodesStyles } from "../../../styles";
import { useDMCollapsedFieldsStore, useDMIOConfigPanelStore } from '../../../../store/store';
import { getTypeName } from "../../utils/common-utils";
import { ARRAY_FILTER_NODE_PREFIX } from "../../utils/constants";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
export interface InputNodeWidgetProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    dmType: DMType;
    engine: DiagramEngine;
    getPort: (portId: string) => InputOutputPortModel;
    context: IDataMapperContext;
    valueLabel?: string;
    nodeHeaderSuffix?: string;
}

export function InputNodeWidget(props: InputNodeWidgetProps) {
    const { engine, dmType, id, getPort, context, valueLabel, nodeHeaderSuffix } = props;
    const focusedOnRoot = context.views.length === 1;
    
    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);
    const collapsedFieldsStore = useDMCollapsedFieldsStore();

	const { setIsIOConfigPanelOpen, setIOConfigPanelType, setIsSchemaOverridden } = useDMIOConfigPanelStore(state => ({
		setIsIOConfigPanelOpen: state.setIsIOConfigPanelOpen,
		setIOConfigPanelType: state.setIOConfigPanelType,
		setIsSchemaOverridden: state.setIsSchemaOverridden
	}));

    const classes = useIONodesStyles();
    const typeName = getTypeName(dmType);

    const portOut = getPort(`${id}.OUT`);

    let fields: DMType[];

    if (dmType?.kind === TypeKind.Interface) {
        fields = dmType.fields;
    } else if (dmType.kind === TypeKind.Array) {
        fields = [{...dmType.memberType, fieldName: `<${dmType.fieldName}Item>`}];
    }

    let expanded = true;
    if (portOut && portOut.collapsed) {
        expanded = false;
    }

    /** Invisible port to which the arrow headed link from the filter node is connected to */
    const invisiblePort = getPort(`${ARRAY_FILTER_NODE_PREFIX}`);

    const label = (
        <TruncatedLabel style={{ marginRight: "auto" }}>
            <span className={classes.valueLabel}>
                <InputSearchHighlight>{valueLabel ? valueLabel : id}</InputSearchHighlight>
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.inputTypeLabel}>
                    {typeName}
                </span>
            )}
        </TruncatedLabel>
    );

    const handleExpand = () => {
        if (!expanded) {
            collapsedFieldsStore.expandField(id, dmType.kind);
        } else {
            collapsedFieldsStore.collapseField(id, dmType.kind);
        }
    }

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const onMouseEnter = () => {
        setIsHovered(true);
    };

    const onMouseLeave = () => {
        setIsHovered(false);
    };

    const handleChangeSchema = () => {
        setIOConfigPanelType(IOType.Input);
        setIsSchemaOverridden(true);
        setIsIOConfigPanelOpen(true);
    };

    const onRightClick = (event: React.MouseEvent) => {
        event.preventDefault();
        if (focusedOnRoot) handleChangeSchema();
    };

    return (
        <TreeContainer data-testid={`${id}-node`} onContextMenu={onRightClick}>
            <div className={classes.filterPortWrap}>
                {invisiblePort && <PortWidget port={invisiblePort} engine={engine} />}
            </div>
            <TreeHeader
                id={"recordfield-" + id}
                isSelected={portState !== PortState.Unselected}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <span className={classes.label}>
                    {fields && (
                        <Button
                            id={"expand-or-collapse-" + id} 
                            appearance="icon"
                            tooltip="Expand/Collapse"
                            onClick={handleExpand}
                            data-testid={`${id}-expand-icon-record-source-node`}
                        >
                            {expanded ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
                        </Button>
                    )}
                    {label}
                    <span className={classes.nodeType}>{nodeHeaderSuffix}</span>
                </span>
                {focusedOnRoot && (
                    <Button
                        appearance="icon"
                        data-testid={"change-input-schema-btn"}
                        tooltip="Change input schema"
                        sx={{ marginRight: "5px" }}
                        onClick={handleChangeSchema}
                        data-field-action
                    >
                        <Codicon
                            name="edit"
                            iconSx={{ color: "var(--vscode-input-placeholderForeground)" }}
                        />
                    </Button>
                )}
                <span className={classes.outPort}>
                    {portOut &&
                        <DataMapperPortWidget engine={engine} port={portOut} handlePortState={handlePortState} />
                    }
                </span>
            </TreeHeader>
            {expanded && fields && (
                <TreeBody>
                    {
                        fields.map((field, index) => {
                            return (
                                <InputNodeTreeItemWidget
                                    key={index}
                                    engine={engine}
                                    dmType={field}
                                    getPort={getPort}
                                    parentId={id}
                                    treeDepth={0}
                                    hasHoveredParent={isHovered}
                                />
                            );
                        })
                    }
                </TreeBody>
            )}
        </TreeContainer>
    );
}
