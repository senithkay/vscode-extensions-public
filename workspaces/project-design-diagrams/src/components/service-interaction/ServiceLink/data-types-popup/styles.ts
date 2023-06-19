/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { CSSProperties } from 'react';
import styled from '@emotion/styled';

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    font-family: GilmerRegular;
    font-size: 13px;
    letter-spacing: 0.8px;
    padding: 15px;
`;

export const MenuButton = styled.div`
    position: absolute;
    right: 8px;
    top: 15px;
`;

export const clickableType: CSSProperties = {
    color: '#3366CC',
    cursor: 'grab',
    textDecoration: 'underline'
}

export const defaultType: CSSProperties = {
    cursor: 'default'
}
