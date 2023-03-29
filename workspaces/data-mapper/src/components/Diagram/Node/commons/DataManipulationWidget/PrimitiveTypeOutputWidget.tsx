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
import { STNode } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { DataMapperPortWidget, RecordFieldPortModel } from "../../../Port";
import { OutputSearchHighlight } from '../SearchHighlight';
import { TreeBody, TreeContainer, TreeHeader } from "../Tree/Tree";

import { PrimitiveTypedEditableElementWidget } from "./PrimitiveTypedEditableElementWidget";

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
}


export function PrimitiveTypeOutputWidget(props: PrimitiveTypeOutputWidgetProps) {
	const { id, field, getPort, engine, context, typeName, valueLabel, deleteField } = props;
	const classes = useStyles();

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
			{type && (
				<span className={classes.typeLabel}>
					{type}
				</span>
			)}

		</span>
	);

	const handleExpand = () => {
		context.handleCollapse(fieldId, !expanded);
	}

	return (
		<TreeContainer data-testid={`${id}-node`}>
			<TreeHeader>
				<span className={classes.treeLabelInPort}>
					{portIn && !expanded &&
						<DataMapperPortWidget engine={engine} port={portIn} />
					}
				</span>
				<span className={classes.label}>
					<IconButton
						className={classes.expandIcon}
						style={{ marginLeft: indentation }}
						onClick={handleExpand}
						data-testid={`${id}-expand-icon-primitive-type`}
					>
						{expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
					</IconButton>
					{label}
				</span>
			</TreeHeader>
			<TreeBody>
				{expanded && field && (
					<PrimitiveTypedEditableElementWidget
						key={id}
						parentId={id}
						engine={engine}
						field={field}
						getPort={getPort}
						context={context}
						deleteField={deleteField}
					/>
				)}
			</TreeBody>
		</TreeContainer>
	);
}
