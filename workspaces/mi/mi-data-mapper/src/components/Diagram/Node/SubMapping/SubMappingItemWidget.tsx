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

import { Button, Codicon, Icon } from "@wso2-enterprise/ui-toolkit";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { Node } from "ts-morph";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { getTypeName } from "../../utils/common-utils";
import { OutputSearchHighlight } from "../commons/Search";
import { TreeBody, TreeHeader } from '../commons/Tree/Tree';
import { useIONodesStyles } from "../../../styles";
import { InputNodeTreeItemWidget } from "../Input/InputNodeTreeItemWidget";
import { useDMCollapsedFieldsStore } from "../../../../store/store";

export interface LetVarDeclItemProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    typeDesc: DMType;
    engine: DiagramEngine;
    declaration: Node;
    context: IDataMapperContext;
    getPort: (portId: string) => InputOutputPortModel;
    valueLabel?: string;
}

export function SubMappingItemWidget(props: LetVarDeclItemProps) {
    const { engine, typeDesc, id, getPort, valueLabel } = props;
    const classes = useIONodesStyles();
    const collapsedFieldsStore = useDMCollapsedFieldsStore();

    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);

    const typeName = getTypeName(typeDesc);
    const portOut = getPort(`${id}.OUT`);
    const expanded = !(portOut && portOut.collapsed);
    const isRecord = typeDesc.kind === TypeKind.Interface;
    const hasFields = !!typeDesc?.fields?.length;

    const label = (
        <span style={{ marginRight: "auto" }} data-testid={`local-var-widget-label-${id}`}>
            <span className={classes.valueLabel}>
                <OutputSearchHighlight>{valueLabel ? valueLabel : id}</OutputSearchHighlight>
                {typeName && ":"}
            </span>
            {typeName && (
                <span className={classes.inputTypeLabel}>
                    {typeName !== `$CompilationError$` ? typeName : 'var'}
                </span>
            )}

        </span>
    );

    const handleExpand = () => {
		const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter(element => element !== id));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, id]);
        }
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
                    {isRecord && hasFields && (
                        <Button
                            appearance="icon"
                            tooltip="Expand/Collapse"
                            onClick={handleExpand}
                            data-testid={`${id}-expand-icon-local-var-node`}
                        >
                            {expanded ? <Codicon name="chevron-right" /> : <Codicon name="chevron-down" />}
                        </Button>
                    )}
                    {label}
                </span>
                <span className={classes.outPort}>
                    {portOut && (
                        <DataMapperPortWidget
                            engine={engine}
                            port={portOut}
                            dataTestId={`local-variable-port-${portOut.getName()}`}
                        />
                    )}
                </span>
            </TreeHeader>
            {
                expanded && isRecord && hasFields && (
                    <TreeBody>
                        {typeDesc.fields.map((field, index) => {
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
                        })}
                    </TreeBody>
                )
            }
        </>
    );
}
