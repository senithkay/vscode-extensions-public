/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';

interface StyleProps {
    rotate?: string;
    topMargin?: number;
    leftMargin?: number;
}

export const GatewayContainer: React.FC<any> = styled.div`
    opacity: 0;
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
