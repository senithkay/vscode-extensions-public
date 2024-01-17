// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import { DiagramEngine } from '@projectstorm/react-diagrams';

import { BinaryExpressionNode } from './BinaryExpressionNode';
import { Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';


export interface BinaryExpressionNodeWidgetProps {
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
				{/* <Typography variant="h6">
					{node.value.source}
				</Typography> */}
			</div>
		);
	}
}

export const BinaryExpressionNodeWidget = styled(BinaryExpressionNodeWidgetC)`
	width: '100%';
	max-width: 500;
	// backgroundColor: theme.palette.background.default;
	color: "var(--vscode-input-background)"
`;
