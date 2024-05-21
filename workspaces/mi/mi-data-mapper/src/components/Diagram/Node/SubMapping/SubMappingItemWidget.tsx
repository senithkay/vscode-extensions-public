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

import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { Node } from "ts-morph";
import { keyframes } from "@emotion/react";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { getTypeName } from "../../utils/common-utils";
import { OutputSearchHighlight } from "../commons/Search";
import { TreeBody } from '../commons/Tree/Tree';
import { useIONodesStyles } from "../../../styles";
import { InputNodeTreeItemWidget } from "../Input/InputNodeTreeItemWidget";
import { useDMCollapsedFieldsStore } from "../../../../store/store";
import classnames from "classnames";
import styled from "@emotion/styled";

export interface SubMappingItemProps {
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    type: DMType;
    engine: DiagramEngine;
    declaration: Node;
    context: IDataMapperContext;
    isLastItem: boolean;
    getPort: (portId: string) => InputOutputPortModel;
    valueLabel?: string;
};
const fadeInZoomIn = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

const zoomIn = keyframes`
    0% {
        transform: scale(0.9);
    }
    100% {
        transform: scale(1.2);
    }
`;

const HoverButton = styled(Button)`
    animation: ${fadeInZoomIn} 0.2s ease-out forwards;
    &:hover {
        animation: ${zoomIn} 0.2s ease-out forwards;
    };
`;

export function SubMappingItemWidget(props: SubMappingItemProps) {
    const { engine, type, id, isLastItem, getPort, valueLabel } = props;
    const classes = useIONodesStyles();
    const collapsedFieldsStore = useDMCollapsedFieldsStore();

    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredSeperator, setIsHoveredSeperator] = useState(false);

    const typeName = getTypeName(type);
    const portOut = getPort(`${id}.OUT`);
    const expanded = !(portOut && portOut.collapsed);
    const isRecord = type.kind === TypeKind.Interface;
    const hasFields = !!type?.fields?.length;

    const label = (
        <span style={{ marginRight: "auto" }} data-testid={`sub-mapping-item-widget-label-${id}`}>
            <span className={classes.valueLabel}>
                <OutputSearchHighlight>{valueLabel ? valueLabel : id}</OutputSearchHighlight>
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

    const onMouseEnterSeperator = () => {
        setIsHoveredSeperator(true);
    };

    const onMouseLeaveSeperator = () => {
        setIsHoveredSeperator(false);
    };

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    return (
        <>
            <div
                id={"recordfield-" + id}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={classnames(
                    classes.treeLabel, (portState !== PortState.Unselected) ? classes.treeLabelPortSelected : ""
                )}
            >
                <span className={classes.label}>
                    {isRecord && hasFields && (
                        <Button
                            appearance="icon"
                            tooltip="Expand/Collapse"
                            onClick={handleExpand}
                            data-testid={`${id}-expand-icon-sub-mapping-node`}
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
                            dataTestId={`sub-mapping-port-${portOut.getName()}`}
                            handlePortState={handlePortState}
                        />
                    )}
                </span>
            </div>
            {
                expanded && isRecord && hasFields && (
                    <TreeBody>
                        {type.fields.map((field, index) => {
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
            <div
                onMouseEnter={onMouseEnterSeperator}
                onMouseLeave={onMouseLeaveSeperator}
                className={classes.subMappingItemSeparator}
            >
                {isHoveredSeperator && !isLastItem && (
                    <HoverButton
                        appearance="icon"
                        tooltip="Add another sub mapping here"
                        className={classes.addAnotherSubMappingButton}
                    >
                        <Codicon name="add" iconSx={{ fontSize: 10 }} />
                    </HoverButton>
                )}
            </div>
            {isLastItem && (
                <Button
                    className={classes.addSubMappingButton}
                    appearance='icon'
                    aria-label="add"
                    onClick={undefined}
                    data-testid={"add-another-sub-mapping-btn"}
                >
                    <Codicon name="add" iconSx={{ color: "var(--button-primary-foreground)"}} />
                    <div>Add Another Sub Mapping</div>
                </Button>
            )}
        </>
    );
}
