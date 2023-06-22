/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import { Colors } from '../../../resources';

export const Container: React.FC<any> = styled.div`
    align-items: center;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
	flex-direction: column;
    font-family: ${(props: { isSelected: boolean }) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 12px;
    justify-content: center;
    line-height: 16px;
	min-height: 60px;
	min-width: 60px;
	padding-inline: 6px;
    text-transform: capitalize;
	text-align: center;
`;

export const IconContainer: React.FC<any> = styled.div`
	align-items: center;
	background-color: #FFFFFF;
	border: ${(props: { isSelected: boolean }) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY_LIGHT}`};
	border-radius: 50%;
	display: flex;
	height: 50px;
	justify-content: center;
	position: relative;
	width: 50px;
`;
