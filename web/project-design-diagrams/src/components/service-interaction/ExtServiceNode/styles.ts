/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
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
import { Colors } from '../../../resources';

export const Container = styled.div`
    align-items: center;
    color: ${Colors.PRIMARY};
    display: flex;
	flex-direction: column;
    font-family: ${(props: { isSelected: boolean }) => props.isSelected ? `GilmerMedium` : `GilmerRegular`};
    font-size: 12px;
    justify-content: center;
    line-height: 16px;
	min-height: 60px;
	width: 60px;
	padding-inline: 6px;
    text-transform: capitalize;
`;

export const IconContainer = styled.div`
	align-items: center;
	background-color: #FFFFFF;
	border: ${(props: { isSelected: boolean }) => props.isSelected ? `2px solid ${Colors.PRIMARY_SELECTED}` :
		`1px solid ${Colors.PRIMARY}`};
	border-radius: 50%;
	display: flex;
	height: 50px;
	justify-content: center;
	position: relative;
	width: 50px;
`;
