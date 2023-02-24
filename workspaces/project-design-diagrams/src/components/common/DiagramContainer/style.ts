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
import { Views } from '../../../resources';

interface DiagramContainerStyleProps {
  currentView: Views;
}

export const CellContainer = styled.div`
  width: calc(100vw - 100px);
  height: calc(100vh - 100px);
  position: relative;
  clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
  &:before {
    position: absolute;
    z-index: -1;
    inset: 0;
    background: #5567D5;
    clip-path: inherit;
    content: ''
  }
  overflow: hidden;
`;

export const CanvasWrapper = styled.div`
  position: absolute;
  top: 1px;
  left: 1px;
  width: calc(100vw - 100px - 2px);
  height: calc(100vh - 100px - 2px);
  clip-path: polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%);
`;

export const CellContainerWrapper = styled.div`
  position: relative;
  width: calc(100vw - 100px);
  flex-direction: column;
  padding-top: 30px;
  padding-bottom: 20px;
  z-index: 1;
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
  z-index: 2;
`;
