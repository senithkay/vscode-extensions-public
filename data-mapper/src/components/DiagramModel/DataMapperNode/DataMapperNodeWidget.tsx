import * as React from 'react';
import { DataMapperNodeModel } from './DataMapperNode';
import { DiagramEngine, PortModelAlignment } from '@projectstorm/react-diagrams';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { DataMapperPortWidget } from './DataMapperPortWidget';
import { DataMapperNodeField } from './DataMapperNodeField';
import { List } from '@material-ui/core';

export interface DataMapperNodeWidgetProps {
	node: DataMapperNodeModel;
	engine: DiagramEngine;
	size?: number;
}


export class DataMapperNodeWidget extends React.Component<DataMapperNodeWidgetProps> {
	render() {
		const node = this.props.node;
		const stNode = node.stNode;

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
				<List dense={true}>
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
