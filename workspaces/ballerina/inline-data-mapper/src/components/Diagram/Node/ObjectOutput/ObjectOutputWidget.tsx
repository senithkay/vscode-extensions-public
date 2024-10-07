/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from 'react';

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Button, Codicon } from '@wso2-enterprise/ui-toolkit';

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from "../../Mappings/MappingMetadata";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { ObjectFieldAdder, TreeBody, TreeContainer, TreeHeader } from '../commons/Tree/Tree';
import { ObjectOutputFieldWidget } from "./ObjectOutputFieldWidget";
import { useIONodesStyles } from '../../../styles';
import {
	useDMCollapsedFieldsStore,
	useDMExpressionBarStore,
	useDMIOConfigPanelStore,
	useDMSubMappingConfigPanelStore
} from '../../../../store/store';
import { OutputSearchHighlight } from '../commons/Search';
import { OBJECT_OUTPUT_FIELD_ADDER_TARGET_PORT_PREFIX } from '../../utils/constants';

export interface ObjectOutputWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	dmTypeWithValue: DMTypeWithValue;
	typeName: string;
	value: any;
	engine: DiagramEngine;
	getPort: (portId: string) => InputOutputPortModel;
	context: IDataMapperContext;
	mappings?: MappingMetadata[];
	valueLabel?: string;
	deleteField?: (node: any) => Promise<void>;
	originalTypeName?: string;
}

export function ObjectOutputWidget(props: ObjectOutputWidgetProps) {
	const {
		id,
		dmTypeWithValue,
		typeName,
		value,
		engine,
		getPort,
		context,
		valueLabel,
		deleteField
	} = props;
	const { views } = context;
	const focusedView = views[views.length - 1];
	const focuesOnSubMappingRoot = focusedView.subMappingInfo && focusedView.subMappingInfo.focusedOnSubMappingRoot;

	const classes = useIONodesStyles();

	const [portState, setPortState] = useState<PortState>(PortState.Unselected);
	const [isHovered, setIsHovered] = useState(false);
	const [hasFirstClickOnOutput, setHasFirstClickOnOutput] = useState(false);

	const collapsedFieldsStore = useDMCollapsedFieldsStore();

	const { setIsIOConfigPanelOpen, setIOConfigPanelType, setIsSchemaOverridden } = useDMIOConfigPanelStore(state => ({
		setIsIOConfigPanelOpen: state.setIsIOConfigPanelOpen,
		setIOConfigPanelType: state.setIOConfigPanelType,
		setIsSchemaOverridden: state.setIsSchemaOverridden
	}));

	const {subMappingConfig, setSubMappingConfig} = useDMSubMappingConfigPanelStore(state => ({
		subMappingConfig: state.subMappingConfig,
		setSubMappingConfig: state.setSubMappingConfig
	}));

	const exprBarFocusedPort = useDMExpressionBarStore(state => state.focusedPort);

	const { childrenTypes } = dmTypeWithValue;
	const fields = childrenTypes || [];
	const hasFields = fields.length > 0;

	const portIn = getPort(`${id}.IN`);
    const isExprBarFocused = exprBarFocusedPort?.getName() === portIn?.getName();

	let expanded = true;
	if ((portIn && portIn.collapsed)) {
		expanded = false;
	}
	const isDisabled = portIn?.descendantHasValue;

	const indentation = (portIn && (!hasFields || !expanded)) ? 0 : 24;

	useEffect(() => {
		if (focuesOnSubMappingRoot) {
			const dynamicOutputPort = getPort(`${OBJECT_OUTPUT_FIELD_ADDER_TARGET_PORT_PREFIX}.IN`);
			
			dynamicOutputPort.registerListener({
				eventDidFire(event) {
					if (event.function === "firstClickedOnDynamicOutput") {
						setHasFirstClickOnOutput(true);
						setTimeout(() => setHasFirstClickOnOutput(false), 3000);
					}
				},
			})
		}
	}, []);

	const handleExpand = () => {
		const collapsedFields = collapsedFieldsStore.collapsedFields;
        if (!expanded) {
            collapsedFieldsStore.setCollapsedFields(collapsedFields.filter((element) => element !== id));
        } else {
            collapsedFieldsStore.setCollapsedFields([...collapsedFields, id]);
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

	const label = (
		<span style={{ marginRight: "auto" }}>
			{valueLabel && (
				<span className={classes.valueLabel}>
					<OutputSearchHighlight>{valueLabel}</OutputSearchHighlight>
					{typeName && ":"}
				</span>
			)}
			<span className={classes.outputTypeLabel}>
				{typeName || ''}
			</span>
		</span>
	);

	const onRightClick = (event: React.MouseEvent) => {
		event.preventDefault();
		if (focuesOnSubMappingRoot) {
			onSubMappingEditBtnClick();
		} else {
			setIOConfigPanelType("Output");
			setIsSchemaOverridden(true);
			setIsIOConfigPanelOpen(true);
		}
    };

	const onSubMappingEditBtnClick = () => {
		setSubMappingConfig({
			...subMappingConfig,
			isSMConfigPanelOpen: true
		});
	};

	return (
		<>
			<TreeContainer data-testid={`${id}-node`} onContextMenu={onRightClick}>
				<TreeHeader
					isSelected={portState !== PortState.Unselected}
					id={"recordfield-" + id}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					className={isExprBarFocused ? classes.treeLabelPortExprFocused : ""}
				>
					<span className={classes.inPort}>
						{portIn && (
							<DataMapperPortWidget
								engine={engine}
								port={portIn}
								handlePortState={handlePortState}
								disable={isDisabled && !expanded}
							/>)
						}
					</span>
					<span className={classes.label}>
						<Button
							appearance="icon"
							tooltip="Expand/Collapse"
							sx={{ marginLeft: indentation }}
							onClick={handleExpand}
							data-testid={`${id}-expand-icon-mapping-target-node`}
						>
							{expanded ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
						</Button>
						{label}
					</span>
					{focuesOnSubMappingRoot && (
						<Button
							appearance="icon"
							data-testid={"edit-sub-mapping-btn"}
							tooltip="Edit name and type of the sub mapping "
							onClick={onSubMappingEditBtnClick}
						>
							<Codicon
								name="settings-gear"
								iconSx={{ color: "var(--vscode-input-placeholderForeground)" }}
							/>
						</Button>
					)}
				</TreeHeader>
				{(expanded && fields) && (
					<TreeBody>
						{fields?.map((item, index) => {
							return (
								<ObjectOutputFieldWidget
									key={index}
									engine={engine}
									field={item}
									getPort={getPort}
									parentId={id}
									parentObjectLiteralExpr={value}
									context={context}
									treeDepth={0}
									deleteField={deleteField}
									hasHoveredParent={isHovered}
								/>
							);
						})}
					</TreeBody>
				)}
				{focuesOnSubMappingRoot && (
					<ObjectFieldAdder id={`recordfield-${OBJECT_OUTPUT_FIELD_ADDER_TARGET_PORT_PREFIX}`}>
						<span className={classes.objectFieldAdderLabel}>
							Dynamically add inputs to output
						</span>
						{hasFirstClickOnOutput && (
							<div className={classes.dynamicOutputNotification}>
								Click on input field first to add a dynamic output
							</div>
						)}
					</ObjectFieldAdder>
				)}
			</TreeContainer>
		</>
	);
}
