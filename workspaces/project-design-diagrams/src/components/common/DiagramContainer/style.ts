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
import React from "react";
import { Coordinate } from "../CellDiagram/CellDiagram";

export const CellContainer: React.FC<any> = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  clip-path: ${(props: CellContainerProps) => `polygon(${props.vertices[0].x}px ${props.vertices[0].y}px, ${props.vertices[1].x}px ${props.vertices[1].y}px, ${props.vertices[2].x}px ${props.vertices[2].y}px, ${props.vertices[3].x}px ${props.vertices[3].y}px, ${props.vertices[4].x}px ${props.vertices[4].y}px, ${props.vertices[5].x}px ${props.vertices[5].y}px, ${props.vertices[6].x}px ${props.vertices[6].y}px, ${props.vertices[7].x}px ${props.vertices[7].y}px)`};
  background: #5567D5;
  overflow: hidden;
`;

export const CanvasWrapper: React.FC<any> = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  //top: 1px;
  //left: 1px;
  //width: calc(100% - 2px);
  //height: calc(100% - 2px);
  clip-path: ${(props: CellContainerProps) => `polygon(${props.vertices[0].x}px ${props.vertices[0].y + 1}px, ${props.vertices[1].x - 1}px ${props.vertices[1].y + 1}px, ${props.vertices[2].x - 1}px ${props.vertices[2].y}px, ${props.vertices[3].x - 1}px ${props.vertices[3].y}px, ${props.vertices[4].x - 1}px ${props.vertices[4].y - 1}px, ${props.vertices[5].x + 1}px ${props.vertices[5].y - 1}px, ${props.vertices[6].x + 1}px ${props.vertices[6].y}px, ${props.vertices[7].x + 1}px ${props.vertices[7].y}px)`};
`;

interface CellContainerProps {
  isConsoleView?: boolean;
  vertices?: Coordinate[];
}

export const CellContainerControls: React.FC<any> = styled.div`
  display: flex;
  align-items: flex-end;
  position: relative;
  bottom: 120px;
` ;

export const CellDiagramWrapper: React.FC<any> = styled.div`
  display: flex;
  flex-direction: column;
` ;

export const CellContainerWrapper: React.FC<any> = styled.div`
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
