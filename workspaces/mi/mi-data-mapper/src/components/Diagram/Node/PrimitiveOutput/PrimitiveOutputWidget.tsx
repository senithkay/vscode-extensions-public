/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { Button, Codicon } from '@wso2-enterprise/ui-toolkit';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Node } from "ts-morph";

import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortWidget, InputOutputPortModel } from "../../Port";

import { PrimitiveOutputElementWidget } from "./PrimitiveOutputElementWidget";
import { TreeBody, TreeHeader, TreeContainer } from "../commons/Tree/Tree";
import { useIONodesStyles } from "../../../../components/styles";
import { OutputSearchHighlight } from "../commons/Search";
import { useDMCollapsedFieldsStore, useDMSubMappingConfigPanelStore } from "../../../../store/store";
import FieldActionWrapper from "../commons/FieldActionWrapper";

export interface PrimitiveOutputWidgetProps {
	id: string;
	field: DMTypeWithValue;
	engine: DiagramEngine;
	getPort: (portId: string) => InputOutputPortModel;
	context: IDataMapperContext;
	typeName: string;
	valueLabel?: string;
	deleteField?: (node: Node) => Promise<void>;
}

export function PrimitiveOutputWidget(props: PrimitiveOutputWidgetProps) {
	const { id, field, getPort, engine, context, typeName, valueLabel, deleteField } = props;
	const { views } = context;
	const focusedView = views[views.length - 1];
	const focuesOnSubMappingRoot = focusedView.subMappingInfo && focusedView.subMappingInfo.focusedOnSubMappingRoot;


	const classes = useIONodesStyles();
	const collapsedFieldsStore = useDMCollapsedFieldsStore();

	const { subMappingConfig, setSubMappingConfig } = useDMSubMappingConfigPanelStore(state => ({
		subMappingConfig: state.subMappingConfig,
		setSubMappingConfig: state.setSubMappingConfig
	}));


	const type = typeName || field?.type?.typeName;
	const fieldId = `${id}.${type}`;
	const portIn = getPort(`${fieldId}.IN`);

	let expanded = true;
	if ((portIn && portIn.collapsed)) {
		expanded = false;
	}

	const indentation = (portIn && !expanded) ? 0 : 24;

	const label = (
		<span style={{ marginRight: "auto" }}>
			{valueLabel && (
				<span className={classes.valueLabel}>
					<OutputSearchHighlight>{valueLabel}</OutputSearchHighlight>
					{type && ":"}
				</span>
			)}
			<span className={classes.outputTypeLabel}>{type}</span>
		</span>
	);

	const handleExpand = () => {
		const collapsedFields = collapsedFieldsStore.collapsedFields;
		if (!expanded) {
			collapsedFieldsStore.setCollapsedFields(collapsedFields.filter(element => element !== fieldId));
		} else {
			collapsedFieldsStore.setCollapsedFields([...collapsedFields, fieldId]);
		}
	};

	const onRightClick = (event: React.MouseEvent) => {
		event.preventDefault();
		onSubMappingEditBtnClick();
	};

	const onSubMappingEditBtnClick = () => {
		setSubMappingConfig({
			...subMappingConfig,
			isSMConfigPanelOpen: true
		});
	};

	return (
		<TreeContainer data-testid={`${id}-node`} onContextMenu={onRightClick}>
			<TreeHeader>
				<span className={classes.inPort}>
					{portIn && !expanded &&
						<DataMapperPortWidget engine={engine} port={portIn} />
					}
				</span>
				<span className={classes.label}>
					<FieldActionWrapper>
						<Button
							appearance="icon"
							sx={{ marginLeft: indentation }}
							onClick={handleExpand}
							data-testid={`${id}-expand-icon-primitive-type`}
						>
							{expanded ? <Codicon name="chevron-down" /> : <Codicon name="chevron-right" />}
						</Button>
					</FieldActionWrapper>
					{label}
				</span>
				{focuesOnSubMappingRoot && (
					<FieldActionWrapper>
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
					</FieldActionWrapper>
				)}
			</TreeHeader>
			{expanded && field && (
				<TreeBody>
					<PrimitiveOutputElementWidget
						key={id}
						parentId={id}
						engine={engine}
						field={field}
						getPort={getPort}
						context={context}
						deleteField={deleteField}
					/>
				</TreeBody>
			)}
		</TreeContainer>
	);
}
