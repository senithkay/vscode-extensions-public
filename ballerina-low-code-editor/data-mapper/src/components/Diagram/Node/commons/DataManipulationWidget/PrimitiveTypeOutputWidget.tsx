/*
* Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 Inc. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { TreeBody, TreeContainer, TreeHeader } from "../Tree/Tree";

import { ArrayTypedEditableRecordFieldWidget } from "./ArrayTypedEditableRecordFieldWidget";
import { PrimitiveTypedEditableArrayElementWidget } from "./PrimitiveTypedEditableArrayElementWidget";

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
		valueLabel: {
			verticalAlign: "middle",
			padding: "5px",
			color: "#222228",
			fontFamily: "GilmerMedium",
			fontSize: "13px",
		},
		treeLabelOutPort: {
			float: "right",
			width: 'fit-content',
			marginLeft: "auto",
		},
		treeLabelInPort: {
			float: "left",
			marginRight: "5px",
			width: 'fit-content',
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
		}
	}),
);

export interface PrimitiveTypeOutputWidgetProps {
	id: string;
	field: EditableRecordField;
	engine: DiagramEngine;
	getPort: (portId: string) => RecordFieldPortModel;
	context: IDataMapperContext;
	typeName: string;
	valueLabel?: string;
	deleteField?: (node: STNode) => Promise<void>;
	isParentSelectClause?: boolean;
}


export function PrimitiveTypeOutputWidget(props: PrimitiveTypeOutputWidgetProps) {
	const { id, field, getPort, engine, context, typeName, valueLabel, deleteField, isParentSelectClause } = props;
	const classes = useStyles();

	const hasValue = field && field?.elements && field.elements.length > 0;
	const isBodyListConstructor = field?.value && STKindChecker.isListConstructor(field.value);
	const isBodySimpleNameRef = field?.value && STKindChecker.isSimpleNameReference(field.value);
	const isBodyFieldAccess = field?.value && STKindChecker.isFieldAccess(field.value);
	const isBodyQueryExpr = field?.value && STKindChecker.isQueryExpression(field.value);
	const isArray = field.type.typeName === PrimitiveBalType.Array && (isBodyListConstructor || isBodySimpleNameRef || isBodyFieldAccess || isBodyQueryExpr);

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
					{valueLabel}
					{typeName && ":"}
				</span>
			)}
			{typeName && (
				<span className={classes.typeLabel}>
					{typeName}
				</span>
			)}

		</span>
	);

	const handleExpand = () => {
		context.handleCollapse(id, !expanded);
	}

	return (
		<TreeContainer>
			<TreeHeader>
				<span className={classes.treeLabelInPort}>
					{portIn && (!hasValue
							|| !expanded
							|| (isArray && !isBodyListConstructor)
							|| (isArray && STKindChecker.isListConstructor(field.value) && field.value.expressions.length === 0)
						) &&
						<DataMapperPortWidget engine={engine} port={portIn} />
					}
				</span>
				<span className={classes.label}>
					<IconButton
						className={classes.expandIcon}
						style={{ marginLeft: indentation }}
						onClick={handleExpand}
					>
						{expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
					</IconButton>
					{label}
				</span>
			</TreeHeader>
			<TreeBody>
				{expanded && field && (
					isArray ? (
						isBodyListConstructor && (
							<ArrayTypedEditableRecordFieldWidget
								key={id}
								engine={engine}
								field={field}
								getPort={getPort}
								parentId={id}
								mappingConstruct={undefined}
								context={context}
								isReturnTypeDesc={true}
							/>
						)
					) : (
						<PrimitiveTypedEditableArrayElementWidget
							key={id}
							parentId={id}
							engine={engine}
							field={field}
							getPort={getPort}
							context={context}
							deleteField={deleteField}
							isParentSelectClause={isParentSelectClause}
						/>
					)
				)}
			</TreeBody>
		</TreeContainer>
	);
}
