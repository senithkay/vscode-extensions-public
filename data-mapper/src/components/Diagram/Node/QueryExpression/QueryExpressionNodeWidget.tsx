import * as React from 'react';

import { createStyles, Theme, withStyles, WithStyles } from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';
import { STKindChecker } from '@wso2-enterprise/syntax-tree';

import { DataMapperPortModel, DataMapperPortWidget } from '../../Port';
import { MappingConstructorWidget } from '../commons/MappingConstructorWidget/MappingConstructorWidget';
import { RecordTypeTreeWidgetNew } from "../commons/RecordTypeTreeWidget/RecordTypeTreeWidgetNew";

import { QueryExpressionNode, QUERY_SOURCE_PORT_PREFIX, QUERY_TARGET_PORT_PREFIX } from './QueryExpressionNode';

const styles = (theme: Theme) => createStyles({
	root: {
		width: '100%',
		minWidth: 400,
		backgroundColor: "#fff",
		padding: "5px",
		display: "flex",
		flexDirection: "column",
		gap: "5px",
		color: "#74828F"
	},
	fromClause: {
		padding: "5px",
		fontFamily: "monospace"
	},
	mappingPane: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between"
	},
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	}
});

export interface QueryExpressionNodeWidgetProps extends WithStyles<typeof styles> {
	node: QueryExpressionNode;
	engine: DiagramEngine;
}

class QueryExpressionNodeWidgetC extends React.Component<QueryExpressionNodeWidgetProps> {
	render() {
		const node = this.props.node;
		const classes = this.props.classes;
		const engine = this.props.engine;

		const getSourcePort = (portId: string) => {
			return node.getPort(portId) as DataMapperPortModel;
		}

		const getTargetPort = (portId: string) => {
			return node.getPort(portId) as DataMapperPortModel;
		}

		return (
			<div
				className={classes.root}
			>
				<div className={classes.header}>
					<DataMapperPortWidget engine={engine} port={node.inPort} />
					<div className={classes.fromClause}>
						Query: {node.value.queryPipeline.fromClause.expression.source}
					</div>
					<DataMapperPortWidget engine={engine} port={node.outPort} />
				</div>
				<div className={classes.mappingPane}>
					<RecordTypeTreeWidgetNew
						engine={engine}
						typeDesc={node.sourceTypeDesc}
						id={`${QUERY_SOURCE_PORT_PREFIX}.${node.sourceBindingPattern.variableName.value}`}
						getPort={getSourcePort}
					/>
					{STKindChecker.isMappingConstructor(node.value.selectClause.expression) &&
						<MappingConstructorWidget engine={engine} value={node.value.selectClause.expression} id={QUERY_TARGET_PORT_PREFIX} getPort={getTargetPort} />
					}

				</div>
			</div>
		);
	}
}

export const QueryExpressionNodeWidget = withStyles(styles, { withTheme: true })(QueryExpressionNodeWidgetC);
