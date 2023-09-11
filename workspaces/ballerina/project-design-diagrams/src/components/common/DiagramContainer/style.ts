/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React from "react";
import { Coordinate } from "../CellDiagram/CellDiagram";
import { ConsoleView } from "../../../resources";

export const CellContainer: React.FC<any> = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  clip-path: ${(props: CellContainerProps) => props.path };
  background: #5567D5;
  overflow: hidden;
`;

export const CanvasWrapper: React.FC<any> = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  clip-path: ${(props: CellContainerProps) => props.path };
`;

interface CellContainerProps {
  isConsoleView?: boolean;
  consoleView?: ConsoleView;
  canvasHeight?: number;
  path: string;
  vertices?: Coordinate[];
}

export const CellContainerControls: React.FC<any> = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  left: ${(props: CellContainerProps) => `${props.isConsoleView ? 92 : 102}px`};
  margin-top: ${(props: CellContainerProps) => `${props.isConsoleView ? props.canvasHeight + 164 : '0'}px`};
` ;

export const CellDiagramWrapper: React.FC<any> = styled.div`
  display: flex;
  flex-direction: row;
  align-items: ${(props: CellContainerProps) => props.isConsoleView ? 'flex-start' : 'normal'};
  min-height: ${(props: CellContainerProps) => props.isConsoleView ? 'calc(100vh - 250px)' : 'calc(100vh - 90px)'};
` ;

export const CellContainerWrapper: React.FC<any> = styled.div`
  display: flex;
  position: relative;
  left: ${(props: CellContainerProps) => props.consoleView === ConsoleView.PROJECT_HOME ? '65px' : '50px'};
  width: calc(100% - 102px);
  flex-direction: column;
  padding-top: 30px;
  padding-bottom: 10px;
  z-index: 1;
  min-height: ${(props: CellContainerProps) => props.consoleView ? 'calc(100vh - 250px)' : 'calc(100vh - 90px)'};
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
