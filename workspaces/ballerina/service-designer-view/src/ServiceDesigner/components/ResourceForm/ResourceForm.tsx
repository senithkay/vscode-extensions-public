/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { ActionButtons, Button, Divider, SidePanel, SidePanelBody, SidePanelTitleContainer, Typography } from '@wso2-enterprise/ui-toolkit';
import { ResourcePath } from '../ResourcePath/ResourcePath';
import { Response } from '../ResourceResponse/ResourceResponse';
import { ResourceParam } from '../ResourceParam/ResourceParam';
import { PARAM_TYPES, ParameterConfig, ResponseConfig } from '../../definitions';
import { Payload } from '../Payload/Payload';
import { AdvancedParams } from '../AdvancedParam/AdvancedParam';

export interface ResourceFormProps {
	isOpen: boolean;
    onClose: () => void;
}

export function ResourceForm(props: ResourceFormProps) {
    const { isOpen, onClose } = props;
	const [parameters, setParameters] = useState<ParameterConfig[]>([{id: 0, name: "PARAM1", type: "string", option: PARAM_TYPES.DEFAULT, isRequired: true}]);
	const [advancedParams, setAdvancedParam] = useState<Map<string, ParameterConfig>>(new Map([
		[PARAM_TYPES.HEADER, { id: 0, name: "PARAM1", type: "string", option: PARAM_TYPES.HEADER }]
	]));
	const [payload, setPayload] = useState<ParameterConfig>({id: 0, name: "PARAM1", type: "string", option: PARAM_TYPES.PAYLOAD});
	const [response, setResponse] = useState<ResponseConfig[]>([{id: 0, code: 200}]);

	const handleParamChange = (params: ParameterConfig[]) => {
		setParameters(params);
	};

	const handleAdvancedParamChange = (params: Map<string, ParameterConfig>) => {
		setAdvancedParam(params);
	};

	const handleResponseChange = (resp: ResponseConfig[]) => {
		setResponse(resp);
	};

	const handlePayloadChange = (params: ParameterConfig) => {
		setPayload(params);
	};

	return (
		<>
			<SidePanel
				isOpen={isOpen}
				alignmanet="right"
				sx={{width: 600}}
			>
				<SidePanelTitleContainer>
					<Typography sx={{margin: 0}} variant="h3">Configure Resource</Typography>
					<Button onClick={onClose} appearance="icon">X</Button>
				</SidePanelTitleContainer>

				<SidePanelBody>
					<ResourcePath />

					<Divider />

					<Typography sx={{marginBlockEnd: 10}} variant="h4">Parameters</Typography>
					<ResourceParam parameters={parameters} onChange={handleParamChange}/>
					<Payload parameter={payload} onChange={handlePayloadChange}/>
					<Typography sx={{marginBlockEnd: 10}} variant="h4">Advanced Parameters</Typography>
					<AdvancedParams parameters={advancedParams} onChange={handleAdvancedParamChange}/>
					<Divider />

					<Typography sx={{marginBlockEnd: 10}} variant="h4">Responses</Typography>
					<Response response={response} onChange={handleResponseChange}/>

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
