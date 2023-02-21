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
import React, { useMemo, useState } from "react";

import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from "../../../Port";
import { getExprBodyFromLetExpression, isConnectedViaLink } from "../../../utils/dm-utils";
import { TreeBody, TreeContainer, TreeHeader } from "../Tree/Tree";

import { ArrayTypedEditableRecordFieldWidget } from "./ArrayTypedEditableRecordFieldWidget";

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
		typeLabelDisabled: {
			backgroundColor: "#F7F8FB",
			color: "#40404B",
			opacity: 0.5
		},
		valueLabel: {
			verticalAlign: "middle",
			padding: "5px",
			color: "#222228",
			fontFamily: "GilmerMedium",
			fontSize: "13px",
		},
		valueLabelDisabled: {
			backgroundColor: "#F7F8FB",
			color: "#1D2028",
			opacity: 0.5
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
		expandIconDisabled: {
			color: "#9797a9",
		},
		treeLabelDisabled: {
			backgroundColor: "#F7F8FB",
			'&:hover': {
				backgroundColor: '#F7F8FB',
			},
			cursor: 'not-allowed'
		}
	}),
);

export interface ArrayTypeOutputWidgetProps {
	id: string;
	field: EditableRecordField;
	engine: DiagramEngine;
	getPort: (portId: string) => RecordFieldPortModel;
	context: IDataMapperContext;
	typeName: string;
	valueLabel?: string;
	deleteField?: (node: STNode) => Promise<void>;
}

export function ArrayTypeOutputWidget(props: ArrayTypeOutputWidgetProps) {
	const { id, field, getPort, engine, context, typeName, valueLabel, deleteField } = props;
	const classes = useStyles();

	const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);

	const body = field?.value && STKindChecker.isLetExpression(field.value)
		? getExprBodyFromLetExpression(field.value)
		: field.value;
	const hasValue = field && field?.elements && field.elements.length > 0;
	const isBodyListConstructor = body && STKindChecker.isListConstructor(body);
	const isBodyQueryExpression = body && STKindChecker.isQueryExpression(body);
	const hasSyntaxDiagnostics = field?.value && field.value.syntaxDiagnostics.length > 0;

	const portIn = getPort(`${id}.IN`);

	let expanded = true;
	if ((portIn && portIn.collapsed)) {
		expanded = false;
	}

	const indentation = (portIn && (!hasValue || !expanded)) ? 0 : 24;
	const shouldPortVisible = (isBodyQueryExpression || !hasSyntaxDiagnostics)
		&& (!hasValue || !expanded || !isBodyListConstructor || (
			STKindChecker.isListConstructor(field.value) && field.value.expressions.length === 0
	));

	const hasElementConnectedViaLink = useMemo(() => {
		if (isBodyListConstructor) {
			return body.expressions.some(expr => isConnectedViaLink(expr));
		}
	}, [body]);

	let isDisabled = portIn.descendantHasValue;
	if (expanded && !isDisabled && isBodyListConstructor && body.expressions.length > 0) {
		portIn.setDescendantHasValue();
		isDisabled = true;
	} else if (!expanded && !hasElementConnectedViaLink && !isDisabled && isBodyListConstructor && body.expressions.length > 0) {
		isDisabled = true;
	}

	const label = (
		<span style={{ marginRight: "auto" }}>
			{valueLabel && (
				<span className={classnames(classes.valueLabel, isDisabled ? classes.valueLabelDisabled : "")}>
					{valueLabel}
					{typeName && ":"}
				</span>
			)}
			{typeName && (
				<span className={classnames(classes.typeLabel, isDisabled ? classes.typeLabelDisabled : "")}>
					{typeName}
				</span>
			)}
		</span>
	);

	const handleExpand = () => {
		context.handleCollapse(id, !expanded);
	};

	const handlePortState = (state: PortState) => {
		setPortState(state)
	};

	return (
		<TreeContainer data-testid={`${id}-node`}>
			<TreeHeader isSelected={portState !== PortState.Unselected} isDisabled={isDisabled} id={"recordfield-" + id}>
				<span className={classes.treeLabelInPort}>
					{portIn && shouldPortVisible && (
						<DataMapperPortWidget
							engine={engine}
							port={portIn}
							disable={isDisabled}
							handlePortState={handlePortState}
						/>
					)}
				</span>
				<span className={classes.label}>
					<IconButton
						className={classnames(classes.expandIcon, isDisabled ? classes.expandIconDisabled : "")}
						style={{ marginLeft: indentation }}
						onClick={handleExpand}
						data-testid={`${id}-expand-icon-mapping-target-node`}
					>
						{expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
					</IconButton>
					{label}
				</span>
			</TreeHeader>
			<TreeBody>
				{expanded && field && isBodyListConstructor && (
					<ArrayTypedEditableRecordFieldWidget
						key={id}
						engine={engine}
						field={field}
						getPort={getPort}
						parentId={id}
						parentMappingConstruct={undefined}
						context={context}
						deleteField={deleteField}
						isReturnTypeDesc={true}
					/>
				)}
			</TreeBody>
		</TreeContainer>
	);
}
