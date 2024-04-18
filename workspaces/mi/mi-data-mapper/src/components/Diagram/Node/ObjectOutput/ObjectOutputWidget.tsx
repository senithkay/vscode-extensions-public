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
import { Node } from "ts-morph";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { MappingMetadata } from "../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortWidget, PortState, InputOutputPortModel } from '../../Port';
import { OutputSearchHighlight } from '../commons/Search';
import { TreeBody, TreeContainer, TreeHeader } from '../commons/Tree/Tree';
import { ObjectOutputFieldWidget } from "./ObjectOutputFieldWidget";
import { useIONodesStyles } from '../../../styles';
import { useDMCollapsedFieldsStore } from '../../../../store/store';
import { getPosition } from '../../utils/st-utils';
import { isEmptyValue } from '../../utils/common-utils';

export interface ObjectOutputWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	dmTypeWithValue: DMTypeWithValue;
	typeName: string;
	value: Node;
	engine: DiagramEngine;
	getPort: (portId: string) => InputOutputPortModel;
	context: IDataMapperContext;
	valueLabel?: string;
	mappings?: MappingMetadata[];
	deleteField?: (node: Node) => Promise<void>;
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
		mappings,
		valueLabel,
		deleteField
	} = props;
	const classes = useIONodesStyles();

	const [portState, setPortState] = useState<PortState>(PortState.Unselected);
	const [isHovered, setIsHovered] = useState(false);
	const collapsedFieldsStore = useDMCollapsedFieldsStore();

	const fields = dmTypeWithValue && dmTypeWithValue.childrenTypes;
	const hasValue = fields && fields.length > 0;
	const isBodyObjectLiteralExpr = value && Node.isObjectLiteralExpression(value);

	const hasSyntaxDiagnostics = false; // TODO: Find diagnostics for the value
	const hasEmptyFields = mappings && (mappings.length === 0 || !mappings.some(mapping => {
		if (mapping.value && !mapping.value.wasForgotten()) {
			return !isEmptyValue(getPosition(mapping.value));
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
						{portIn && (isBodyObjectLiteralExpr || !hasSyntaxDiagnostics) && (!hasValue
								|| !expanded
								|| !isBodyObjectLiteralExpr
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
			</TreeContainer>
		</>
	);
}
