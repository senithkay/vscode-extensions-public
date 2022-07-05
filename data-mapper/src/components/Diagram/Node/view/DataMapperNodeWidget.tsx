import * as React from 'react';
import { DataMapperNodeModel } from '../model/DataMapperNode';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { DataMapperNodeField } from './DataMapperNodeField';
import { List, Typography } from '@material-ui/core';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { RecordField, RecordTypeDesc, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { RequiredParamNode } from '../RequiredParam';
import { ExpressionFunctionBodyNode } from '../ExpressionFunctionBody';

const styles = (theme: Theme) => createStyles({
	root: {
		flexGrow: 1,
		maxWidth: 400,
		color: "white",
		position: "relative",
		backgroundColor: "#525564"
	},
});

export interface DataMapperNodeWidgetProps extends WithStyles<typeof styles> {
	node: RequiredParamNode|ExpressionFunctionBodyNode;
	engine: DiagramEngine;
	size?: number;
}


class DataMapperNodeWidgetC extends React.Component<DataMapperNodeWidgetProps> {
	render() {
		const node = this.props.node;
		const typeDesc = node.typeDef.typeDescriptor as RecordTypeDesc;
		const name = STKindChecker.isRequiredParam(node.value) ? node.value.paramName.value : (node.typeDef).typeName.value;
		const classes = this.props.classes;
		const engine = this.props.engine;

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

		const allNodeIds:string[] = [];

		if (STKindChecker.isRecordTypeDesc(typeDesc)) {
			typeDesc.fields.forEach((field) => {
				if (STKindChecker.isRecordField(field)) {
					allNodeIds.push(...getNodeIds(field, name));
				}
			});
		}

		return (
			<TreeView
				className={classes.root}
				defaultCollapseIcon={<ExpandMoreIcon />}
				defaultExpandIcon={<ChevronRightIcon />}
				defaultExpanded={allNodeIds}
			>
				{
					STKindChecker.isRecordTypeDesc(typeDesc) && (
						typeDesc.fields.map((field) => {
							if (STKindChecker.isRecordField(field)) {
								return <DataMapperNodeField
									engine={engine}
									name={field.fieldName.value}
									typeNode={field}
									nodeModel={node}
									parentId={name}
								/>;
							} else {
								// TODO handle fields with default values and included records
								return <></>;
							}
						})
					)
				}
				{
					!STKindChecker.isRecordTypeDesc(typeDesc) && (
						<DataMapperNodeField
							engine={engine}
							name={name}
							typeNode={typeDesc}
							nodeModel={node}
							parentId={""}
						/>
					)
				} {
					// TODO handle other simple types
				}
			</TreeView>
		);
	}
}

export const DataMapperNodeWidget = withStyles(styles, { withTheme: true })(DataMapperNodeWidgetC);