/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { ActionButtons, Button, Codicon, Divider, Dropdown, LinkButton, SidePanel, SidePanelBody, SidePanelTitleContainer, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';

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


export interface ResourceFormProps {
	isOpen: boolean;
    onClose: () => void;
}

const PathContainer = styled.div`
    display: flex;
	flex-direction: row;
`;

const AddButtonWrapper = styled.div`
    display: flex;
	justify-content: flex-end;
	margin: 8px 0;
`;

export function ResourceForm(props: ResourceFormProps) {
    const { isOpen, onClose } = props;

	const [selectedMethod, setSelectedMethod] = useState("GET");
	const [path, setPath] = useState("");

	const handleMethodChange = (input: string) => {
		setSelectedMethod(input);
	};

	const handlePathChange = (input: string) => {
		setPath(input);
	};

	const handlePathAdd = () => {
	};

	return (
		<>
			<SidePanel
				isOpen={isOpen}
				alignmanet="right"
				sx={{width: 600}}
			>
				<SidePanelTitleContainer>
					<>Configure Resource</>
					<Button onClick={onClose} appearance="icon">X</Button>
				</SidePanelTitleContainer>

				<SidePanelBody>
					<PathContainer>
						<div
							style={{
								width: 160
							}}
						>
							<Dropdown
								sx={{width: 160}}
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
							sx={{marginLeft: 10, flexGrow: 1}}
							autoFocus
							errorMsg=""
							label="Resource Path"
							size={70}
							onChange={handlePathChange}
							placeholder="path/foo"
							value={path}
						/>
					</PathContainer>
					<></>
					<AddButtonWrapper>
						<LinkButton onClick={handlePathAdd} >
							<Codicon name="add"/>
							<Typography sx={{margin: 0}} variant="h4">Add Path Param</Typography>
						</LinkButton>
					</AddButtonWrapper>

					<Divider />
					
                    <ActionButtons
                        primaryButton={{ text : "Save", onClick: () => console.log("Save Button Clicked"), tooltip: "Save" }}
                        secondaryButton={{ text : "Cancel", onClick: onClose, tooltip: "Cancel" }}
                        sx={{justifyContent: "flex-end"}}
                    />
                </SidePanelBody>
			</SidePanel>
		</>
	);
}
