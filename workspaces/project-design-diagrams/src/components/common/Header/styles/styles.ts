/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React from 'react';
import { Colors } from '../../../../resources';

export const HeaderContainer = styled.div`
    align-items: center;
    color: #000;
    display: flex;
    flex-direction: row;
    font-family: inherit;
    height: 50px;
    justify-content: space-between;
    width: calc(100% - 30px);
`;

export const DiagramTitle = styled.div`
    font-size: 13px;
    height: 20px;
    line-height: 20px;
    padding-right: 5px;
    text-align: left;
`;

export const TypeContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 200px;
    padding: 12px 20px 12px 24px;
`;

export const TypeTitle = styled.h5`
    color: #40404B;
    font-family: GilmerMedium;
    font-size: 15px;
    line-height: 20px;
`;

export const TypeCard = styled.p`
    font-family: GilmerRegular;
    font-size: 14px;
    line-height: 14px;
    min-width: 150px;
    &:hover {
        cursor: grabbing;
        color: ${Colors.PRIMARY};
    }
`;

export const PopupContainer = styled.div`
    padding: 20px;
`;

export const PackageLabel = styled.span`
    font-family: GilmerRegular;
    font-size: 13px;
    line-height: 20px;
`;

export const HeaderLeftPane: React.FC<any> = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 5px;
    min-width: ${(props: { isEditable: boolean }) => props.isEditable ? '200px' : '340px'};
`;

export const CentralControls: React.FC<any> = styled.div`
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: ${(props: { editingEnabled: boolean }) => props.editingEnabled ? 'center' : 'flex-end'};
    min-width: ${(props: { isChoreoProject: boolean }) => props.isChoreoProject ? '550px' : '350px'};
`;
