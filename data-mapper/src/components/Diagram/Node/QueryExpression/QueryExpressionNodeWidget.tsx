import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

import { List, Typography } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { QueryExpressionNode, QUERY_SOURCE_PORT_PREFIX, QUERY_TARGET_PORT_PREFIX } from './QueryExpressionNode';
import { DataMapperPortModel, DataMapperPortWidget } from '../../Port';
import { RecordTypeTreeWidget } from '../commons/RecordTypeTreeWidget/RecordTypeTreeWidget';
import { MappingConstructorWidget } from '../commons/MappingConstructorWidget/MappingConstructorWidget';
import { STKindChecker } from '@wso2-enterprise/syntax-tree';

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
		fontFamily: "monospace",
		display: "flex"
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

		const isFullScreen = node.isFullScreen;

		const goFullScreen = () => {
			node.context.setSelectedST(node.value);
		}

		const exitFullScreen = () => {
			node.context.setSelectedST(node.context.functionST);
		}

		const getSourcePort = (portId: string) => {
			return node.getPort(portId) as DataMapperPortModel;
		}

		const getTargetPort = (portId: string) => {
			return node.getPort(portId) as DataMapperPortModel;
		}

		return (
			<div
				className={classes.root}
				style={{
					minWidth: isFullScreen ? 1000 : 400,
					background: isFullScreen ? "none" : "#fff"
				}}
			>
				<div className={classes.header}>
					{node.inPort && <DataMapperPortWidget engine={engine} port={node.inPort} />}
					<div className={classes.fromClause}>
						<span style={{ marginTop: "3px", backgroundColor: "#fff" }}>
							Query: {node.value.queryPipeline.fromClause.expression.source}
						</span>
							{!isFullScreen && <FullscreenIcon onClick={goFullScreen} style={{ cursor: "pointer" }} />}
							{isFullScreen && <FullscreenExitIcon onClick={exitFullScreen} style={{ cursor: "pointer" }} />}
					</div>

					{node.outPort && <DataMapperPortWidget engine={engine} port={node.outPort} />}
				</div>
				<div className={classes.mappingPane}>
					<RecordTypeTreeWidget 
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