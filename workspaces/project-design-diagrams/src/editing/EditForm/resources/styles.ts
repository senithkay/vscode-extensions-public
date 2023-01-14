/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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

export const PrimaryContainer = styled.div`
    display: flex;
    flex-direction: column;
    font-family: GilmerRegular;
    font-size: 15px;
    height: 100vh;
    opacity: ${(props: { isLoading: boolean }) => props.isLoading ? 0.3 : 1};
    width: 370px;
`;

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    font-family: GilmerRegular;
    font-size: 15px;
    height: 100vh;
    opacity: ${(props: { isLoading: boolean }) => (props.isLoading ? 0.3 : 1)};
`;

export const Header = styled.div`
    align-items: center;
    align-self: stretch;
    box-shadow: inset 0px -1px 0px #E0E2E9;
    color: #1D2028;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    height: 50px;
    padding: 12px 12px 12px 20px;
`;

export const TitleText = styled.span`
    font-family: GilmerBold;
    font-size: 14px;
`;

export const InputComponent = styled.div`
    display: flex;
    flex-direction: column;
    font-family: GilmerRegular;
    font-size: 13px;
    padding: 12px 16px 12px 20px
`;

export const ControlsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 20px 0px 10px 10px;
`;

export const AdvancedSettings = styled.div`
    cursor: pointer;
    display: flex;
    flex-direction: column;
`;

export const AdvancedControlsHeader = styled.div`
    align-items: center;
    color: #1D2028;
    display: flex;
    flex-direction: row;
    height: 35px;
    padding: 12px 12px 0px 20px;
`;

export const Required = styled.span`
    color: red;
    font-size: 14px;
`;
