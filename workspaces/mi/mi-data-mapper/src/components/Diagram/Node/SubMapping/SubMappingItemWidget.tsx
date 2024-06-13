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

import { Button, Codicon, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { Block } from "ts-morph";
import classnames from "classnames";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { genVariableName, getSubMappingViewLabel, getTypeName } from "../../utils/common-utils";
import { OutputSearchHighlight } from "../commons/Search";
import { TreeBody } from '../commons/Tree/Tree';
import { useIONodesStyles } from "../../../styles";
import { InputNodeTreeItemWidget } from "../Input/InputNodeTreeItemWidget";
import { useDMCollapsedFieldsStore, useDMSubMappingConfigPanelStore } from "../../../../store/store";
import { DMSubMapping } from "./SubMappingNode";
import { SourceNodeType } from "../../../../components/DataMapper/Views/DataMapperView";
import { SubMappingSeparator } from "./SubMappingSeparator";

export interface SubMappingItemProps {
    index: number;
    id: string; // this will be the root ID used to prepend for UUIDs of nested fields
    type: DMType;
    engine: DiagramEngine;
    context: IDataMapperContext;
    subMappings: DMSubMapping[];
    getPort: (portId: string) => InputOutputPortModel;
    valueLabel?: string;
};

export function SubMappingItemWidget(props: SubMappingItemProps) {
    const { index, id, type, engine, context, subMappings, getPort, valueLabel } = props;
    const { functionST, views, addView, applyModifications } = context;
    const isOnRootView = views.length === 1;

    const classes = useIONodesStyles();
    const collapsedFieldsStore = useDMCollapsedFieldsStore();
    const setSubMappingConfig = useDMSubMappingConfigPanelStore(state => state.setSubMappingConfig);

    const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);
    const [isHovered, setIsHovered] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const typeName = getTypeName(type);
    const portOut = getPort(`${id}.OUT`);
    const expanded = !(portOut && portOut.collapsed);
    const isRecord = type.kind === TypeKind.Interface;
    const hasFields = !!type?.fields?.length;
    const isFirstItem = index === 0;
    const isLastItem = index === subMappings.length - 1;

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

    const onClickAddSubMapping = () => {
        const varName = genVariableName("subMapping", subMappings.map(mapping => mapping.name));
        setSubMappingConfig({
            isSMConfigPanelOpen: true,
            nextSubMappingIndex: isFirstItem ? index : index + 1,
            suggestedNextSubMappingName: varName
        });
    };

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

    const handlePortState = (state: PortState) => {
        setPortState(state)
    };

    const onClickOnExpand = () => {
        const subMapping = subMappings[index];
        const label = getSubMappingViewLabel(subMapping.name, subMapping.type);
        addView(
            {
                targetFieldFQN: "",
                sourceFieldFQN: "",
                sourceNodeType: SourceNodeType.InputNode,
                label: label,
                subMappingInfo: {
                    index,
                    mappingName: subMapping.name,
                    mappingType: typeName,
                    focusedOnSubMappingRoot: true
                }
            }
        );
    };

    const onClickOnDelete = async () => {
        setDeleteInProgress(true);
        (functionST.getBody() as Block).removeStatement(index);
        applyModifications();
        setDeleteInProgress(false);
    };

    return (
        <>
            {isFirstItem && (
                <SubMappingSeparator
                    isOnRootView={isOnRootView}
                    onClickAddSubMapping={onClickAddSubMapping}
                />
            )}
            <div
                id={"recordfield-" + id}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={classnames(
                    classes.subMappingItemLabel, portState !== PortState.Unselected ? classes.treeLabelPortSelected : ""
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
                    <Button
                        id={`go-to-sub-mapping-btn-${index}`}
                        appearance="icon"
                        data-testid={`go-to-sub-mapping-btn-${index}`}
                        tooltip="Go to sub mapping"
                        onClick={onClickOnExpand}
                    >
                        <Codicon
                            name="export"
                            iconSx={{ color: "var(--vscode-input-placeholderForeground)" }}
                        />
                    </Button>
                    {deleteInProgress ? <ProgressRing sx={{ height: '16px', width: '16px' }} /> :
                        <Button
                            appearance="icon"
                            tooltip="Delete sub mapping"
                            onClick={onClickOnDelete}
                            data-testid={`delete-sub-mapping-btn-${index}`}
                        >
                            <Codicon
                                name="trash"
                                iconSx={{ marginLeft: "5px", color: "var(--vscode-errorForeground)" }}
                            />
                        </Button>
                    }
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
            <SubMappingSeparator
                isOnRootView={isOnRootView}
                isLastItem={isLastItem}
                onClickAddSubMapping={onClickAddSubMapping}
            />
            {isLastItem && isOnRootView && (
                <Button
                    className={classes.addSubMappingButton}
                    appearance='icon'
                    aria-label="add"
                    onClick={onClickAddSubMapping}
                    data-testid={"add-another-sub-mapping-btn"}
                >
                    <Codicon name="add" iconSx={{ color: "var(--button-primary-foreground)"}} />
                    <div>Add Another Sub Mapping</div>
                </Button>
            )}
        </>
    );
}
