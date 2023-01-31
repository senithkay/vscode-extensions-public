/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: no-implicit-dependencies jsx no-var-requires
import React from "react";

import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";

const background = require('../resources/assets/PatternBg.svg') as string;

export const Container = styled.div`
  // should take up full height minus the height of the header
  height: calc(100vh - 70px);
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
                <Global styles={Expand}/>
                <Container className="dotted-background">
                    {this.props.children}
                </Container>
            </>
        );
    }
}
