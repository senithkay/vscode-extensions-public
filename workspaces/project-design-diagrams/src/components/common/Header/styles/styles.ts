/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import styled from '@emotion/styled';
import { Colors } from '../../../../resources';

export const HeaderContainer = styled.div`
    align-items: center;
    color: #000;
    display: flex;
    flex-direction: row;
    font-family: inherit;
    height: 50px;
    justify-content: space-between;
    min-width: 700px;
    width: calc(100vw - 40px);
`;

export const DiagramTitle = styled.div`
    font-size: 13px;
    height: 20px;
    line-height: 20px;
    text-align: right;
    width: 160px;
`;

export const TypeContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 312px;
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
