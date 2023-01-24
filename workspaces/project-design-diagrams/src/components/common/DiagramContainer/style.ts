/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

export const CanvasContainer = styled.div`
  height: 85vh;
  width: 85vw;
  position: relative;
  clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
`;

interface DiagramContainerStyleProps {
    display?: string;
}

export const Diagram = styled.div`
  display: ${(props: DiagramContainerStyleProps) => `${props.display}`};
  flex-direction: column;
  padding-top: 60px;
`;

interface GatewayContainerProps {
    left?: string;
    top?: string;
}

export const GatewayContainer = styled.div`
  width: 100px;
  height: 100px;
  position: absolute;
  left: ${(props: GatewayContainerProps) => props.left};
  top: ${(props: GatewayContainerProps) => props.top};
  z-index: 1;
  clip-path: circle(50% at 50% 50%);
`;
