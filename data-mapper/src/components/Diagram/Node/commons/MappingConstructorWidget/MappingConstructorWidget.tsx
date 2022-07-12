import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import { MappingConstructor, RecordField, RecordTypeDesc, SpecificField, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { DataMapperPortModel } from '../../../Port';
import { SpecificFieldWidget } from './SpecificFieldWidget';

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

export interface MappingConstructorWidgetProps {
	id: string; // this will be the root ID used to prepend for UUIDs of nested fields
	typeDesc?: RecordTypeDesc;
	value: MappingConstructor;
	engine: DiagramEngine;
    getPort: (portId: string) => DataMapperPortModel;
}


export function MappingConstructorWidget(props: MappingConstructorWidgetProps) {
	const { engine, typeDesc, id, getPort, value } = props;
	const classes = useStyles();

	const getNodeIds = (field: SpecificField, parentId: string) => {
		const currentNodeId = parentId + "." + field.fieldName.value;
		const nodeIds = [currentNodeId];
		if (STKindChecker.isMappingConstructor(field.valueExpr)) {
			field.valueExpr.fields.forEach((subField) => {
				if (STKindChecker.isSpecificField(subField)) {
					nodeIds.push(...getNodeIds(subField, currentNodeId));
				}
			});
		}
		return nodeIds;
	}

	const allNodeIds: string[] = [];

	if (STKindChecker.isMappingConstructor(value)) {
		value.fields.forEach((field) => {
			if(STKindChecker.isSpecificField(field)) {
				allNodeIds.push(...getNodeIds(field, id));
			}
		})
	}

	return (
		<div className={classes.root}>
			{
				value.fields.map((field) => {
					if (STKindChecker.isSpecificField(field)) {
						return <SpecificFieldWidget
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
