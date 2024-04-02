/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useState } from 'react';

import { DiagramEngine } from '@projectstorm/react-diagrams';
import { Button, Codicon } from '@wso2-enterprise/ui-toolkit';
import { Node, isObjectLiteralExpression } from "typescript";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../../Mappings/DMTypeWithValue";
import { FieldAccessToSpecificFied } from "../../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from '../../../Port';
import { OutputSearchHighlight } from '../Search';
import { TreeBody, TreeContainer, TreeHeader } from '../Tree/Tree';
import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";
import { useIONodesStyles } from '../../../../styles';
import { useDMCollapsedFieldsStore } from '../../../../../store/store';

export interface EditableMappingConstructorWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	editableRecordField: DMTypeWithValue;
	typeName: string;
	value: Node;
	engine: DiagramEngine;
	getPort: (portId: string) => RecordFieldPortModel;
	context: IDataMapperContext;
	valueLabel?: string;
	mappings?: FieldAccessToSpecificFied[];
	deleteField?: (node: Node) => Promise<void>;
	originalTypeName?: string;
}


export function EditableMappingConstructorWidget(props: EditableMappingConstructorWidgetProps) {
	const {
		id,
		editableRecordField,
		typeName,
		value,
		engine,
		getPort,
		context,
		mappings,
		valueLabel,
		deleteField
	} = props;
	const classes = useIONodesStyles();

	const [portState, setPortState] = useState<PortState>(PortState.Unselected);
	const [isHovered, setIsHovered] = useState(false);
	const collapsedFieldsStore = useDMCollapsedFieldsStore();

	const editableRecordFields = editableRecordField && editableRecordField.childrenTypes;
	const hasValue = editableRecordFields && editableRecordFields.length > 0;
	const isBodyMappingConstructor = value && isObjectLiteralExpression(value);
	// const hasSyntaxDiagnostics = value && value.syntaxDiagnostics.length > 0;
	const hasSyntaxDiagnostics = false;
	const hasEmptyFields = mappings && (mappings.length === 0 || !mappings.some(mapping => {
		if (mapping.value) {
			// check if the field has a value
			// return !isEmptyValue(mapping.value.position);
			return false;
		}
		return true;
	}));

	const portIn = getPort(`${id}.IN`);

	let expanded = true;
	if ((portIn && portIn.collapsed)) {
		expanded = false;
	}

	const indentation = (portIn && (!hasValue || !expanded)) ? 0 : 24;

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

	return (
		<>
			<TreeContainer data-testid={`${id}-node`}>
				<TreeHeader
					isSelected={portState !== PortState.Unselected}
					id={"recordfield-" + id}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				>
					<span className={classes.inPort}>
						{portIn && (isBodyMappingConstructor || !hasSyntaxDiagnostics) && (!hasValue
								|| !expanded
								|| !isBodyMappingConstructor
								|| hasEmptyFields
							) &&
							<DataMapperPortWidget engine={engine} port={portIn} handlePortState={handlePortState} />
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
							{expanded ? <Codicon name="chevron-right" /> : <Codicon name="chevron-down" />}
						</Button>
						{label}
					</span>
				</TreeHeader>
				{(expanded && editableRecordFields) && (
					<TreeBody>
						{editableRecordFields?.map((item, index) => {
							return (
								<EditableRecordFieldWidget
									key={index}
									engine={engine}
									field={item}
									getPort={getPort}
									parentId={id}
									parentMappingConstruct={value}
									context={context}
									treeDepth={0}
									deleteField={deleteField}
									hasHoveredParent={isHovered}
								/>
							);
						})}
					</TreeBody>
				)}
			</TreeContainer>
		</>
	);
}
