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

export const PrimaryContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`;

export const Header = styled.div`
    align-items: center;
    align-self: stretch;
    box-shadow: inset 0px -1px 0px #E0E2E9;
    color: #1D2028;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 60px;
    min-width: 312px;
    padding: 12px 20px 12px 24px;
`;

export const HeaderTitle = styled.span`
    font-family: GilmerMedium;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
`;
