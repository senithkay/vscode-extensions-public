import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { List, Typography } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { QueryExpressionNode } from './QueryExpressionNode';
import { SourceNodeWidget } from './SourceNodeWidget';

const styles = (theme: Theme) => createStyles({
	root: {
		width: '100%',
		maxWidth: 500,
		backgroundColor: "#525564",
		padding: "25px",
		display: "flex", 
		color: theme.palette.text.primary
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
				<SourceNodeWidget typeDesc={node.sourceTypeDesc} />
			</div>
		);
	}
}

export const QueryExpressionNodeWidget = withStyles(styles, { withTheme: true })(QueryExpressionNodeWidgetC);