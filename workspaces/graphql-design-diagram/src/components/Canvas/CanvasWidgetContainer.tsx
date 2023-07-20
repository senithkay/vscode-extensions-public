/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: no-implicit-dependencies jsx no-var-requires
import React from "react";

import styled from "@emotion/styled";

const background = require('../resources/assets/PatternBg.svg') as string;

const headerHeight = 110;

export const Container: React.FC<any> = styled.div`
  // should take up full height minus the height of the header
  height: calc(100vh - ${headerHeight}px);
  background-image: url('${background}');
  background-repeat: repeat;
  display: flex;
  font-family: 'GilmerRegular';

  > * {
    height: 100%;
    min-height: 100%;
    width: 100%;
  }
  svg:not(:root) {
    overflow: visible;
  }
`;

export class CanvasWidgetContainer extends React.Component {
    render() {
        return (
            <Container className="dotted-background">
                {this.props.children}
            </Container>
        );
    }
}
