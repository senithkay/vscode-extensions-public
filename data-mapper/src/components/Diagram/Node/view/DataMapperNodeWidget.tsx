import * as React from 'react';
import { DataMapperNodeModel } from '../model/DataMapperNode';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { DataMapperNodeField } from './DataMapperNodeField';
import { List, Typography } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { RecordTypeDesc, STKindChecker } from '@wso2-enterprise/syntax-tree';

const styles = (theme: Theme) => createStyles({
	root: {
		width: '100%',
		maxWidth: 500,
		// backgroundColor: theme.palette.background.default,
		color: "white"
	}
});

export interface DataMapperNodeWidgetProps extends WithStyles<typeof styles> {
	node: DataMapperNodeModel;
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

		return (
			<div
				className={'datamapper-node'}
				style={{
					position: 'relative',
					width: this.props.size,
					height: this.props.size,
					color: 'white'
				}}
			>
				<Typography variant="h5">
					{name}
				</Typography>
				<List dense component="nav" className={classes.root}>
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
				</List>

			</div>
		);
	}
}

export const DataMapperNodeWidget = withStyles(styles, { withTheme: true })(DataMapperNodeWidgetC);