/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import styled from '@emotion/styled';
import React from 'react';

const Container = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	color: var(--vscode-descriptionForeground);
	width: 100%;
	opacity: 0.5;
	gap: 10px;
	width: 100%;
    max-width: 300px;
`;

const Line = styled.div`
	flex: 1;
	height: 1px;
	background: var(--vscode-descriptionForeground)

`

export const Separator = ({text}:{text?: string}) => {
	if(text){
		<Container>
			<Line />
		</Container>
	}
	return (
		<Container>
			<Line />
			<span>{text}</span>
			<Line />
		</Container>
	);
};
