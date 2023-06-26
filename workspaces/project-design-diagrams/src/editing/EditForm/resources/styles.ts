/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';

export const PrimaryContainer: React.FC<any> = styled.div`
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
`;

export const Header = styled.div`
    align-items: center;
    align-self: stretch;
    box-shadow: inset 0px -1px 0px #E0E2E9;
    color: #1D2028;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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

export const SelectLabel = styled.span`
    margin-bottom: 5px;
`;
