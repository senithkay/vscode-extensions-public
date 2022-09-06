import * as React from 'react';
import styled from '@emotion/styled';
import { css, Global } from '@emotion/react';

const background = require("./../../../assets/PatternBg.svg") as string;

namespace S {
	export const Container = styled.div`
		height: 100%;
		background-image: url('${background}');
		background-repeat: repeat;
		display: ${props => (props.hidden ? 'none' : 'flex')};
		font-family: 'GilmerRegular';
		> * {
			height: 100%;
			min-height: 100%;
			width: 100%;
		}
	`;

	export const Expand = css`
		html,
		body,
		#root {
			height: 100%;
		}
	`;
}

export class DataMapperCanvasContainerWidget extends React.Component<{ hideCanvas: boolean }> {
	render() {
		return (
			<>
				<Global styles={S.Expand} />
				<S.Container className='dotted-background' hidden={this.props.hideCanvas}>
					{this.props.children}
				</S.Container>
			</>
		);
	}
}
