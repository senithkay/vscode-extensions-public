/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { Codicon, Dropdown, LinkButton, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { PathParam } from '../../definitions';

const verbs = [
	{
		content: 'GET',
		id: 'GET',
		value: 'GET'
	},
	{
		content: 'PUT',
		id: 'PUT',
		value: 'PUT'
	},
	{
		content: 'DELETE',
		id: 'DELETE',
		value: 'DELETE'
	},
	{
		content: 'POST',
		id: 'POST',
		value: 'POST'
	},
	{
		content: 'PATCH',
		id: 'PATCH',
		value: 'PATCH'
	}
];

const PathContainer = styled.div`
    display: flex;
	flex-direction: row;
`;

const AddButtonWrapper = styled.div`
    display: flex;
	justify-content: flex-end;
	margin: 8px 0;
`;

export function ResourcePath() {
	const [selectedMethod, setSelectedMethod] = useState("GET");
	const [path, setPath] = useState("");
	const [pathParams, setPathParams] = useState<PathParam[]>([]);

	const handleMethodChange = (input: string) => {
		setSelectedMethod(input);
	};

	const handlePathChange = (input: string) => {
		setPath(input);
	};

	const handlePathAdd = () => {
		const param: PathParam = { type: "string", name: "param" };
		const updatedParameters = [...pathParams];
		updatedParameters.push(param)
		setPathParams(updatedParameters);
		setPath(`${path}/[${param.type} ${param.name}]`);
	};

	return (
		<>
			<PathContainer>
				<div
					style={{
						width: 160
					}}
				>
					<Dropdown
						sx={{ width: 160 }}
						isRequired
						errorMsg=""
						id="drop-down"
						items={verbs}
						label="HTTP Method"
						onChange={handleMethodChange}
						value={selectedMethod}
					/>
				</div>
				<TextField
					sx={{ marginLeft: 15, flexGrow: 1 }}
					autoFocus
					errorMsg=""
					label="Resource Path"
					size={70}
					onChange={handlePathChange}
					placeholder="path/foo"
					value={path}
				/>
			</PathContainer>
			<AddButtonWrapper>
				<LinkButton onClick={handlePathAdd} >
					<Codicon name="add" />
					<>Add Path Param</>
				</LinkButton>
			</AddButtonWrapper>
		</>
	);
}
