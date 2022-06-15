import * as React from 'react';
import { DataMapperNodeModel } from './DataMapperNode';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { DataMapperNodeField } from './DataMapperNodeField';
import { List } from '@material-ui/core';

import { createStyles, withStyles, WithStyles, Theme } from "@material-ui/core/styles";

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
		const stNode = node.stNode;
		const classes = this.props.classes;

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
				<List dense component="nav" className={classes.root}>
					{
						Object.entries(stNode).map((entry: [string, any]): JSX.Element =>
							<DataMapperNodeField
								nodeModel={node} label={entry[0]} value={entry[1]} engine={this.props.engine}
							/>)
					}
				</List>

			</div>
		);
	}
}

export const DataMapperNodeWidget = withStyles(styles, { withTheme: true })(DataMapperNodeWidgetC);