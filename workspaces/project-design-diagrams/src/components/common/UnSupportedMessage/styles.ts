/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

export const Container = styled.div`
    display: block;
    font-family: GilmerRegular;
    font-size: 13px;
    letter-spacing: 0.8px;
    padding: 15px;
    border: 1px solid #ffaf4d;
    background-color: white;
`;

export const WarningContainer = styled.div`
    display: flex;
    flex-direction: row;
    padding-bottom: 10px;
`;

export const WarningMessage = styled.div`
    font-size: 11px;
    margin-left: 10px;
    width: 600px;
`;

export const ResolutionTitle = styled.div`
    margin-left: 26px;
`;

export const WarningResolution = styled.div`
    font-size: 11px;
    margin-left: 36px;
    width: 600px;
`;
