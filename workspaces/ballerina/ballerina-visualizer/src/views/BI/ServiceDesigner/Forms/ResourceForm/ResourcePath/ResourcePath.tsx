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
import { PropertyModel } from '@wso2-enterprise/ballerina-core';

const verbs = [
	{
		content: 'GET',
		id: 'GET',
		value: 'GET'
	},
	{
		content: 'POST',
		id: 'POST',
		value: 'POST'
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

export interface ResourcePathProps {
	path: PropertyModel;
	method: PropertyModel;
	onChange: (method: PropertyModel, path: PropertyModel) => void;
}

export function ResourcePath(props: ResourcePathProps) {
	const { method, path, onChange } = props;

	const handleMethodChange = (value: string) => {
		onChange({ ...method, value }, path);
	};

	const handlePathChange = (value: string) => {
		onChange(method, { ...path, value });
	};

	const handlePathAdd = () => {
		const value = `${path.value}/[string param]`;
		onChange(method, { ...path, value });
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
						onValueChange={handleMethodChange}
						value={method.value.toUpperCase() || method.placeholder.toUpperCase()}
					/>
				</div>
				<TextField
					sx={{ marginLeft: 15, flexGrow: 1 }}
					autoFocus
					errorMsg={""}
					label="Resource Path"
					size={70}
					onTextChange={(input) => {
						const trimmedInput = input.startsWith('/') ? input.slice(1) : input;
						handlePathChange(trimmedInput);
					}}
					placeholder="path/foo"
					value={path.value}
					onFocus={(e) => e.target.select()}
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
