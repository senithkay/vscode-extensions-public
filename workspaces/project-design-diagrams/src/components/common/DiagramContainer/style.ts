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

export const CellContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  clip-path: ${(props: CellContainerProps) => props.isConsoleView ? 'polygon(10% 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0 85%, 0 15%)' : 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'};
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
  display: flex;
  flex-direction: column;
  position: relative;
  top: 1px;
  left: 1px;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  clip-path: ${(props: CellContainerProps) => props.isConsoleView ? 'polygon(10% 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0 85%, 0 15%)' : 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'};
`;

interface CellContainerProps {
  isConsoleView?: boolean;
}

export const CellContainerWrapper = styled.div`
  display: flex;
  position: relative;
  left: 50px;
  width: calc(100% - 100px);
  flex-direction: column;
  padding-top: 30px;
  padding-bottom: 10px;
  z-index: 1;
  height: ${(props: CellContainerProps) => props.isConsoleView ? 'calc(100vh - 250px)' : 'calc(100vh - 90px)'};
`;

interface GatewayContainerProps {
  left?: string;
  top?: string;
  rotate?: string;
}

export const GatewayContainer: React.FC<any> = styled.div`
  width: 60px;
  height: 60px;
  position: absolute;
  left: ${(props: GatewayContainerProps) => props.left};
  top: ${(props: GatewayContainerProps) => props.top};
  transform: ${(props: GatewayContainerProps) => props.rotate ? `rotate(${props.rotate})` : 'rotate(0deg)'};
  z-index: 2;
`;
