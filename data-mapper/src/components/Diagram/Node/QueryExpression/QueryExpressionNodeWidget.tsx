import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { List, Typography } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { QueryExpressionNode } from './QueryExpressionNode';
import { SourceNodeWidget } from './SourceNodeWidget';

const styles = (theme: Theme) => createStyles({
	root: {
		width: '100%',
		minWidth: 400,
		backgroundColor: "#525564",
		padding: "25px",
		display: "flex", 
		flexDirection: "column",
		gap: "20px",
		color: theme.palette.text.primary
	},
	fromClause: {
		backgroundColor: "#74828F",
		color: "white",
		padding: "10px"
	},
	mappingPane: {
		display: "flex", 
		flexDirection: "row",
		justifyContent: "space-between"
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

		return (
			<div
				className={classes.root}
			>
				<div className={classes.fromClause}>
					{node.value.queryPipeline.fromClause.source}
				</div>
				<div className={classes.mappingPane}>
					<SourceNodeWidget typeDesc={node.sourceTypeDesc} />
					<SourceNodeWidget typeDesc={node.sourceTypeDesc} />
				</div>
			</div>
		);
	}
}

export const QueryExpressionNodeWidget = withStyles(styles, { withTheme: true })(QueryExpressionNodeWidgetC);