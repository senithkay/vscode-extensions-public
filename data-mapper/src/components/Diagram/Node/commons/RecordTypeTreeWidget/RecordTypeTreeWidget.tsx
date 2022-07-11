import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { RecordField, RecordTypeDesc, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { DataMapperPortModel } from '../../../Port';
import { RecordFieldTreeItemWidget } from './RecordFieldTreeItemWidget';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
			maxWidth: 400,
			color: "white",
			position: "relative",
			backgroundColor: " #FFFFFF",
			padding:"20px"
		}
	}),
);

export interface RecordTypeTreeWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	typeDesc: RecordTypeDesc;
	engine: DiagramEngine;
    getPort: (portId: string) => DataMapperPortModel;
}


export function RecordTypeTreeWidget(props: RecordTypeTreeWidgetProps) {
	const { engine, typeDesc, id, getPort } = props;
	const classes = useStyles();

	const getNodeIds = (field: RecordField, parentId: string) => {
		const currentNodeId = parentId + "." + field.fieldName.value;
		const nodeIds = [currentNodeId];
		if (STKindChecker.isRecordTypeDesc(field.typeName)) {
			field.typeName.fields.forEach((subField) => {
				if (STKindChecker.isRecordField(subField)) {
					nodeIds.push(...getNodeIds(subField, currentNodeId));
				}
			});
		}
		return nodeIds;
	}

	const allNodeIds: string[] = [];

	if (STKindChecker.isRecordTypeDesc(typeDesc)) {
		typeDesc.fields.forEach((field) => {
			if (STKindChecker.isRecordField(field)) {
				allNodeIds.push(...getNodeIds(field, id));
			}
		});
	}

	return (
		<div className={classes.root}>
			{
				typeDesc.fields.map((field) => {
					if (STKindChecker.isRecordField(field)) {
						return <RecordFieldTreeItemWidget
							engine={engine}
							field={field}
							getPort={getPort}
							parentId={id}
						/>;
					} else {
						// TODO handle fields with default values and included records
						return <></>;
					}
				})
			}
		</div>
	);
}
