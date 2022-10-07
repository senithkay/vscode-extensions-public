import * as React from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { List, Typography } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";
import { RecordTypeDesc, STKindChecker } from '@wso2-enterprise/syntax-tree';
import { BinaryExpressionNode } from './BinaryExpressionNode';

const styles = (theme: Theme) => createStyles({
	root: {
		width: '100%',
		maxWidth: 500,
		// backgroundColor: theme.palette.background.default,
		color: "white"
	}
});

export interface BinaryExpressionNodeWidgetProps extends WithStyles<typeof styles> {
	node: BinaryExpressionNode;
	engine: DiagramEngine;
}

class BinaryExpressionNodeWidgetC extends React.Component<BinaryExpressionNodeWidgetProps> {
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
					{/* {node.value.source} */}
				</Typography>

			</div>
		);
	}
}

export const BinaryExpressionNodeWidget = withStyles(styles, { withTheme: true })(BinaryExpressionNodeWidgetC);