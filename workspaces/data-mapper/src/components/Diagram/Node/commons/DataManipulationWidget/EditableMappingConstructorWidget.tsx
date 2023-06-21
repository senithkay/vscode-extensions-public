/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useMemo, useState } from 'react';

import { CircularProgress } from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { AnydataType, STModification, Type } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { NodePosition, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from '../../../Port';
import {
	getDefaultValue,
	getExprBodyFromLetExpression,
	getExprBodyFromTypeCastExpression,
	getNewFieldAdditionModification,
	getTypeName,
	isEmptyValue
} from "../../../utils/dm-utils";
import { getModification } from "../../../utils/modifications";
import { getSupportedUnionTypes, UnionTypeInfo } from "../../../utils/union-type-utils";
import { AddRecordFieldButton } from '../AddRecordFieldButton';
import { OutputSearchHighlight } from '../Search';
import { TreeBody, TreeContainer, TreeHeader } from '../Tree/Tree';

import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";
import { ValueConfigMenu } from "./ValueConfigButton";
import { ValueConfigMenuItem } from "./ValueConfigButton/ValueConfigMenuItem";

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
			width: 400,
			color: "white",
			position: "relative",
			backgroundColor: " #FFFFFF",
			padding: "20px"
		},
		header: {
			color: "black",
			backgroundColor: "#d8d8ff",
			display: "flex",
			height: "40px",
			padding: "8px"
		},
		typeLabel: {
			marginLeft: "3px",
			verticalAlign: "middle",
			padding: "5px",
			color: "#222228",
			fontFamily: "GilmerRegular",
			fontSize: "13px",
			minWidth: "100px",
			marginRight: "24px"
		},
		boldedTypeLabel: {
			fontFamily: "GilmerBold",
			fontSize: "14px",
		},
		valueLabel: {
			verticalAlign: "middle",
			padding: "5px",
			color: "#222228",
			fontFamily: "GilmerMedium",
			fontSize: "13px",
		},
		treeLabelInPort: {
			float: "left",
			marginRight: "5px",
			width: 'fit-content',
			display: "flex",
			alignItems: "center"
		},
		label: {
			width: "300px",
			whiteSpace: "nowrap",
			overflow: "hidden",
			display: "inline-block",
			textOverflow: "ellipsis",
			"&:hover": {
				overflow: "visible"
			}
		},
		expandIcon: {
			color: theme.palette.common.black,
			height: "25px",
			width: "25px",
			marginLeft: "auto"
		},
		loader: {
			float: "right",
			marginLeft: "auto",
			marginRight: '3px',
			alignSelf: 'center'
		},
	}),
);

export interface EditableMappingConstructorWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	editableRecordField: EditableRecordField;
	typeName: string;
	value: STNode;
	engine: DiagramEngine;
	getPort: (portId: string) => RecordFieldPortModel;
	context: IDataMapperContext;
	valueLabel?: string;
	mappings?: FieldAccessToSpecificFied[];
	deleteField?: (node: STNode) => Promise<void>;
	originalTypeName?: string;
	unionTypeInfo?: UnionTypeInfo;
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
		deleteField,
		originalTypeName,
		unionTypeInfo
	} = props;
	const {	applyModifications } = context;
	const classes = useStyles();

	const [portState, setPortState] = useState<PortState>(PortState.Unselected);
	const [isHovered, setIsHovered] = useState(false);
	const [isModifyingTypeCast, setIsModifyingTypeCast] = useState(false);

	const editableRecordFields = editableRecordField && editableRecordField.childrenTypes;
	const hasValue = editableRecordFields && editableRecordFields.length > 0;
	const isBodyMappingConstructor = value && STKindChecker.isMappingConstructor(value);
	const hasSyntaxDiagnostics = value && value.syntaxDiagnostics.length > 0;
	const hasEmptyFields = mappings && (mappings.length === 0 || !mappings.some(mapping => {
		if (mapping.value) {
			return !isEmptyValue(mapping.value.position);
		}
		return true;
	}));
	const isAnyData = originalTypeName === AnydataType;

	const portIn = getPort(`${id}.IN`);

	let expanded = true;
	if ((portIn && portIn.collapsed)) {
		expanded = false;
	}

	const indentation = (portIn && (!hasValue || !expanded)) ? 0 : 24;

	const getUnionType = () => {
		const typeText: JSX.Element[] = [];
		const { typeNames, resolvedTypeName } = unionTypeInfo;
		typeNames.forEach((type) => {
			if (type.trim() === resolvedTypeName) {
				typeText.push(<span className={classes.boldedTypeLabel}>{type}</span>);
			} else {
				typeText.push(<>{type}</>);
			}
			if (type !== typeNames[typeNames.length - 1]) {
				typeText.push(<> | </>);
			}
		});
		return typeText;
	};

	const label = (
		<span style={{ marginRight: "auto" }}>
			{valueLabel && (
				<span className={classes.valueLabel}>
					<OutputSearchHighlight>{valueLabel}</OutputSearchHighlight>
					{typeName && ":"}
				</span>
			)}
			<span className={classes.typeLabel}>
				{unionTypeInfo ? getUnionType() : typeName || ''}
			</span>
		</span>
	);

	const handleExpand = () => {
		context.handleCollapse(id, !expanded);
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


	const addNewField = async (newFieldName: string) => {
		const modification = getNewFieldAdditionModification(value, newFieldName);
		if (modification) {
			await context.applyModifications(modification);
		}
	}

	const subFieldNames = useMemo(() => {
		const fieldNames: string[] = [];
		editableRecordFields?.forEach(field => {
			if (field.value && STKindChecker.isSpecificField(field.value)) {
				fieldNames.push(field.value?.fieldName?.value)
			}
		})
		return fieldNames;
	}, [editableRecordFields])

	const getTargetPositionForReInitWithTypeCast = () => {
		const rootValueExpr = unionTypeInfo.valueExpr.expression;
		const valueExpr: STNode = STKindChecker.isLetExpression(rootValueExpr)
			? getExprBodyFromLetExpression(rootValueExpr)
			: rootValueExpr;

		return valueExpr.position;
	}

	const getTargetPositionForWrapWithTypeCast = () => {
		const rootValueExpr = unionTypeInfo.valueExpr.expression;
		const valueExpr: STNode = STKindChecker.isLetExpression(rootValueExpr)
			? getExprBodyFromLetExpression(rootValueExpr)
			: rootValueExpr;
		const valueExprPosition: NodePosition = valueExpr.position;

		let targetPosition: NodePosition = {
			...valueExprPosition,
			endLine: valueExprPosition.startLine,
			endColumn: valueExprPosition.startColumn
		}

		if (STKindChecker.isTypeCastExpression(valueExpr)) {
			const exprBodyPosition = getExprBodyFromTypeCastExpression(valueExpr).position;
			targetPosition = {
				...valueExprPosition,
				endLine: exprBodyPosition.startLine,
				endColumn: exprBodyPosition.startColumn
			};
		}

		return targetPosition;
	}

	const handleWrapWithTypeCast = async (type: Type, shouldReInitialize?: boolean) => {
		setIsModifyingTypeCast(true)
		try {
			const name = getTypeName(type);
			const modification: STModification[] = [];
			if (shouldReInitialize) {
				const defaultValue = getDefaultValue(type.typeName);
				const targetPosition = getTargetPositionForReInitWithTypeCast();
				modification.push(getModification(`<${name}>${defaultValue}`, targetPosition));
			} else {
				const targetPosition = getTargetPositionForWrapWithTypeCast();
				modification.push(getModification(`<${name}>`, targetPosition));
			}
			await applyModifications(modification);
		} finally {
			setIsModifyingTypeCast(false);
		}
	};

	const getTypedElementMenuItems = () => {
		const menuItems: ValueConfigMenuItem[] = [];
		const resolvedTypeName = getTypeName(editableRecordField.type);
		const supportedTypes = getSupportedUnionTypes(unionTypeInfo.unionType);

		for (const member of unionTypeInfo.unionType.members) {
			const memberTypeName = getTypeName(member);
			if (!supportedTypes.includes(memberTypeName)) {
				continue;
			}
			const isResolvedType = memberTypeName === resolvedTypeName;
			if (unionTypeInfo.isResolvedViaTypeCast) {
				if (!isResolvedType) {
					menuItems.push({
						title: `Change type cast to ${memberTypeName}`,
						onClick: () => handleWrapWithTypeCast(member, false)
					});
					if (!hasEmptyFields) {
						menuItems.push({
							title: `Re-initialize as ${memberTypeName}`,
							onClick: () => handleWrapWithTypeCast(member, true)
						});
					}
				}
			} else if (supportedTypes.length > 1) {
				if (isResolvedType) {
					menuItems.push({
						title: `Cast type as ${memberTypeName}`,
						onClick: () => handleWrapWithTypeCast(member, false)
					});
				} else {
					menuItems.push(
						{
							title: `Cast type as ${memberTypeName}!`,
							onClick: () => handleWrapWithTypeCast(member, false)
						}, {
							title: `Re-initialize as ${memberTypeName}`,
							onClick: () => handleWrapWithTypeCast(member, true)
						}
					);
				}
			}
		}

		return menuItems;
	};

	const valConfigMenuItems = unionTypeInfo && getTypedElementMenuItems();

	return (
		<>
			<TreeContainer data-testid={`${id}-node`}>
				<TreeHeader
					isSelected={portState !== PortState.Unselected}
					id={"recordfield-" + id}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				>
					<span className={classes.treeLabelInPort}>
						{portIn && (isBodyMappingConstructor || !hasSyntaxDiagnostics) && (!hasValue
								|| !expanded
								|| !isBodyMappingConstructor
								|| hasEmptyFields
							) &&
							<DataMapperPortWidget engine={engine} port={portIn} handlePortState={handlePortState} />
						}
					</span>
					<span className={classes.label}>
						<IconButton
							id={"button-wrapper-" + id}
							className={classes.expandIcon}
							style={{ marginLeft: indentation }}
							onClick={handleExpand}
							data-testid={`${id}-expand-icon-mapping-target-node`}
						>
							{expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
						</IconButton>
						{label}
					</span>
					{unionTypeInfo && (
						<>
							{isModifyingTypeCast ? (
								<CircularProgress size={18} className={classes.loader} />
							) : (
								<ValueConfigMenu menuItems={valConfigMenuItems} portName={portIn?.getName()} />
							)}
						</>
					)}
				</TreeHeader>
				{((expanded && editableRecordFields) || isAnyData) && (
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
						{isAnyData && (
							<AddRecordFieldButton
								addNewField={addNewField}
								indentation={0}
								existingFieldNames={subFieldNames}
								fieldId={id}
							/>
						)}
					</TreeBody>
				)}
			</TreeContainer>
		</>
	);
}
