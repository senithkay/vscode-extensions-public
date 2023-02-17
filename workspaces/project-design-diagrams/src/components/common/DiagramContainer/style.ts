/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import styled from '@emotion/styled';
import { Colors } from "../../../resources";

export const CellContainer = styled.div`
  width: calc(100vw - 100px);
  position: relative;
  border-radius: 40px;
  border: 1px solid #5567D5;
  overflow: hidden;
`;

interface DiagramContainerStyleProps {
    display?: string;
}

export const CellDiagram = styled.div`
  position: relative;
  width: calc(100vw - 100px);
  display: ${(props: DiagramContainerStyleProps) => `${props.display}`};
  flex-direction: column;
  padding-top: 30px;
  padding-bottom: 20px;
  height: calc(100vh - 50px);
`;

interface GatewayContainerProps {
    left?: string;
    top?: string;
    rotate?: string;
}

export const GatewayContainer = styled.div`
  width: 60px;
  height: 60px;
  position: absolute;
  left: ${(props: GatewayContainerProps) => props.left};
  top: ${(props: GatewayContainerProps) => props.top};
  transform: ${(props: GatewayContainerProps) => props.rotate ? `rotate(${props.rotate})` : 'rotate(0deg)'};
  z-index: 1;
  clip-path: circle(50% at 50% 50%);
`;
