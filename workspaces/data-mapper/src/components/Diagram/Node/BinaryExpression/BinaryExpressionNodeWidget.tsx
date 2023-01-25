// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { Typography } from '@material-ui/core';
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { BinaryExpressionNode } from './BinaryExpressionNode';

const styles = () => createStyles({
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
