import * as React from 'react';
import styled from '@emotion/styled';

export interface PanelItemWidgetProps {
	model: any;
	name: string;
}

namespace S {
	export const Tray = styled.div`
		color: #c4c4c4;
        background: #2c2c2c;
		font-family: Helvetica, Arial;
		padding: 5px;
		margin: 0px 10px;
		border-radius: 5px;
		margin-bottom: 2px;
		cursor: pointer;
	`;
}

export class PanelItemWidget extends React.Component<PanelItemWidgetProps> {
	render() {
		return (
			<S.Tray
				draggable={true}
				onDragStart={(event) => {
					event.dataTransfer.setData('storm-diagram-node', JSON.stringify(this.props.model));
				}}
				className="tray-item"
			>
				{this.props.name}
			</S.Tray>
		);
	}
}