/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import { Colors } from '../../../resources';

export const Container = styled.div`
    color: ${Colors.DEFAULT_TEXT};
    display: block;
    font-family: GilmerRegular;
    font-size: 13px;
    line-height: 20px;
    padding: 8px 12px;
`;

export const WarningContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding-bottom: 10px;
`;

export const WarningMessage = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 13px;
    margin-left: 10px;
    gap: 5px;
`;

export const WarningTitle = styled.div`
    font-family: GilmerMedium;
`;

export const ResolutionTitle = styled.div`
    font-family: GilmerMedium;
    margin-left: 26px;
`;

export const WarningResolution = styled.div`
    font-size: 13px;
    margin-left: 36px;
`;
