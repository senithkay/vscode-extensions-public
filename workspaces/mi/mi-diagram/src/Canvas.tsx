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
import { isDarkMode } from "./utils/Utils";

const background = require('./resources/assets/PatternBg.svg') as string;

export const Container: React.FC<any> = styled.div`
  height: 500px;
  position: relative;
  &::before {
    content: "";
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background-image: url('${background}');
    filter: invert(${isDarkMode() ? "1" : "0"});
    background-color: var(--vscode-editor-background);
    background-blend-mode: difference;
  }
  > * {
    height: 100%;
    min-height: 10%;
    width: 100%;
  }
  svg:not(:root) {
    overflow: visible;
    z-index: 99;
    position: relative;
  }
`;

type Props = {
  children: React.ReactNode
}

export const CanvasContainer: React.FC<Props> = (props) => {
  return (
    <Container className="dotted-background">
      {props.children}
    </Container>
  );
}
