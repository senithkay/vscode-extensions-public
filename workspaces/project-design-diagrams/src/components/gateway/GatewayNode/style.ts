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

interface StyleProps {
    rotate?: string;
    topMargin?: number;
    leftMargin?: number;
}

export const GatewayContainer = styled.div`
    background-color: ${Colors.GATEWAY};
    border-radius: 3px;
    color: #fff;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 32px;
    min-width: 100px;
    position: absolute;
    text-align: center;
    vertical-align: middle;
    font-weight: 1000;
    top: ${(props: StyleProps) => `${props.topMargin}px`};
    left: ${(props: StyleProps) => `${props.leftMargin}px`};
    transform: ${(props: StyleProps) => `${props.rotate}`};
`;
