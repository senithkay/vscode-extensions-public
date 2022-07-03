import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { List, Typography } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { QueryExpressionNode } from './QueryExpressionNode';

const styles = (theme: Theme) => createStyles({
	root: {
		width: '100%',
		maxWidth: 500,
		// backgroundColor: theme.palette.background.default,
		color: "white"
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
				className={'datamapper-node'}
				style={{
					position: 'relative',
					color: 'white'
				}}
			>
				<Typography variant="subtitle1">
					{node.value.source}
				</Typography>

			</div>
		);
	}
}

export const QueryExpressionNodeWidget = withStyles(styles, { withTheme: true })(QueryExpressionNodeWidgetC);