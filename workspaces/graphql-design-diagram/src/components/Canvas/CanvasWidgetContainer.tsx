// tslint:disable: no-implicit-dependencies jsx
import React from "react";

import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";

// tslint:disable-next-line:no-var-requires
const background = require('../resources/assets/PatternBg.svg') as string;

export const Container = styled.div`
  // should take up full height minus the height of the header
  height: calc(100% - 50px);
  // background: #E6E8F0;
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


export class CanvasWidgetContainer extends React.Component {
    render() {
        return (
            <>
                <Global styles={Expand} />
                <Container className='dotted-background' >
                    {this.props.children}
                </Container>
            </>
        );
    }
}
