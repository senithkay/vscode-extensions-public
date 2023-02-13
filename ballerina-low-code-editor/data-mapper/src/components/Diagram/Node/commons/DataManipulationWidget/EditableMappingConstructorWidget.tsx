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
import React, { useState } from 'react';

import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from "../../../../../utils/DataMapperContext/DataMapperContext";
import { EditableRecordField } from "../../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortWidget, PortState, RecordFieldPortModel } from '../../../Port';
import { isEmptyValue } from "../../../utils/dm-utils";
import { TreeBody, TreeContainer, TreeHeader } from '../Tree/Tree';

import { EditableRecordFieldWidget } from "./EditableRecordFieldWidget";

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
		}
	}),
);

export interface EditableMappingConstructorWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	editableRecordFields: EditableRecordField[];
	typeName: string;
	value: STNode;
	engine: DiagramEngine;
	getPort: (portId: string) => RecordFieldPortModel;
	context: IDataMapperContext;
	valueLabel?: string;
	mappings?: FieldAccessToSpecificFied[];
	deleteField?: (node: STNode) => Promise<void>;
}


export function EditableMappingConstructorWidget(props: EditableMappingConstructorWidgetProps) {
	const {
        id,
        editableRecordFields,
        typeName,
        value,
        engine,
        getPort,
        context,
        mappings,
        valueLabel,
        deleteField
    } = props;
	const classes = useStyles();

	const [ portState, setPortState ] = useState<PortState>(PortState.Unselected);

	const hasValue = editableRecordFields && editableRecordFields.length > 0;
	const isBodyMappingConstructor = value && STKindChecker.isMappingConstructor(value);
	const hasSyntaxDiagnostics = value && value.syntaxDiagnostics.length > 0;
	const hasEmptyFields = mappings && (mappings.length === 0 || !mappings.some(mapping => {
        if (mapping.value) {
            return !isEmptyValue(mapping.value.position);
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
	};

	const handlePortState = (state: PortState) => {
		setPortState(state)
	};

	return (
		<TreeContainer data-testid={`${id}-node`}>
			<TreeHeader isSelected={portState !== PortState.Unselected} id={"recordfield-" + id}>
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
			</TreeHeader>
			<TreeBody>
				{expanded && editableRecordFields &&
					editableRecordFields.map((item) => {
						return (
							<EditableRecordFieldWidget
								key={id}
								engine={engine}
								field={item}
								getPort={getPort}
								parentId={id}
								parentMappingConstruct={value}
								context={context}
								treeDepth={0}
								deleteField={deleteField}
							/>
						);
					})
				}
			</TreeBody>
		</TreeContainer>
	);
}
