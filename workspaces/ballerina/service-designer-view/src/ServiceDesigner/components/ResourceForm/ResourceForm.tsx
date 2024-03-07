/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { ActionButtons, Button, Divider, LinkButton, SidePanel, SidePanelBody, SidePanelTitleContainer, Typography } from '@wso2-enterprise/ui-toolkit';
import { ResourcePath } from '../ResourcePath/ResourcePath';
import { ResourceResponse } from '../ResourceResponse/ResourceResponse';
import { ResourceParam } from '../ResourceParam/ResourceParam';
import { Payload } from '../Payload/Payload';
import { AdvancedParams } from '../AdvancedParam/AdvancedParam';
import styled from '@emotion/styled';
import { HTTP_METHOD, generateNewResourceFunction, updateResourceFunction } from '../../utils/utils';
import { NodePosition } from '@wso2-enterprise/syntax-tree';
import { PARAM_TYPES, ParameterConfig, Resource, ResponseConfig } from '@wso2-enterprise/service-designer';
import { CommonRPCAPI, STModification } from '@wso2-enterprise/ballerina-core';

const AdvancedParamTitleWrapper = styled.div`
	display: flex;
	flex-direction: row;
`;

export interface ResourceFormProps {
	isOpen: boolean;
	isBallerniaExt?: boolean;
	resourceConfig?: Resource;
	onSave?: (source: string, config: Resource, updatePosition?: NodePosition) => void;
	getRecordST?: (recordName: string) => void;
	addNameRecord?: (source: string) => void;
	serviceEndPosition?: NodePosition;
	commonRpcClient?: CommonRPCAPI;
	onClose: () => void;
	applyModifications?: (modifications: STModification[]) => Promise<void>;
}

export function ResourceForm(props: ResourceFormProps) {
	const { isOpen, isBallerniaExt, resourceConfig, onClose, onSave, addNameRecord, serviceEndPosition, commonRpcClient, applyModifications } = props;

	const [method, setMethod] = useState<HTTP_METHOD>(resourceConfig?.methods[0].toUpperCase() as HTTP_METHOD || HTTP_METHOD.GET);
	const [path, setPath] = useState<string>(resourceConfig?.path || "path");

	const [parameters, setParameters] = useState<ParameterConfig[]>(resourceConfig?.params || []);
	const [advancedParams, setAdvancedParam] = useState<Map<string, ParameterConfig>>(resourceConfig?.advancedParams || new Map<string, ParameterConfig>());
	const [showAdvanced, setShowAdvanced] = useState<boolean>(advancedParams?.size > 0);
	const [payload, setPayload] = useState<ParameterConfig>(resourceConfig?.payloadConfig);
	const [response, setResponse] = useState<ResponseConfig[]>(resourceConfig?.responses || []);

	const handleParamChange = (params: ParameterConfig[]) => {
		setParameters(params);
	};

	const handleAdvanceParamToggle = () => {
		setShowAdvanced(!showAdvanced);
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

	const onPathChange = (method: string, path: string) => {
		setMethod(method as HTTP_METHOD);
		setPath(path);
	}

	const handleSave = () => {
		let paramString = "";

		let advancedParamIndex = 0;
		advancedParams?.forEach((param: ParameterConfig) => {
			const type = param.option === PARAM_TYPES.HEADER ? `http:${PARAM_TYPES.HEADER}s` : param.type;
			paramString += `${type}${param.isRequired || param.option === PARAM_TYPES.HEADER ? "" : "?"} ${param.name}${param.defaultValue ? ` = ${param.defaultValue}` : ""}${advancedParamIndex === advancedParams.size - 1 ? "" : ", "}`;
			advancedParamIndex++;
		});
		paramString += (advancedParams.size > 0 && parameters.length > 0) ? ", " : "";

		if (payload) {
			const payloadType = `@http:${PARAM_TYPES.PAYLOAD} ${payload.type} ${payload.name}${payload.defaultValue ? ` = ${payload.defaultValue}` : ""} ${parameters.length > 0 ? ", " : ""}`;
			paramString += payloadType;
		}

		parameters.map((param: ParameterConfig, index: number) => {
			const type = param.option === PARAM_TYPES.HEADER ? ` @http:${PARAM_TYPES.HEADER} ${param.type}` : param.type;
			paramString += `${type}${param.isRequired ? "" : "?"} ${param.name}${param.defaultValue ? ` = ${param.defaultValue}` : ""}${index === parameters.length - 1 ? "" : ", "}`;
		});


		let responseString = "";
		response.map((resp: ResponseConfig, index: number) => {
			if (resp?.source) {
				responseString += `${resp?.source}${index === response.length - 1 ? "" : " | "}`;
			}
		});

		// Check if "error" is already present in responseString
		if (responseString !== "" && !responseString.includes("error")) {
			responseString += " | error?";
		} else if (responseString === "") {
			responseString = "error?";
		}

		let genSource = "";
		const config = {
			methods: [method],
			path: path,
			params: parameters,
			advancedParams: advancedParams,
			payloadConfig: payload,
			responses: response
		};
		// Insert scenario
		if (!resourceConfig?.updatePosition) {
			// Insert scenario
			genSource = generateNewResourceFunction({ METHOD: method.toLocaleLowerCase(), PATH: path, PARAMETERS: paramString, ADD_RETURN: responseString });
			onSave && onSave(genSource, config);
		} else {
			// Edit scenario
			genSource = updateResourceFunction({ METHOD: method.toLocaleLowerCase(), PATH: path, PARAMETERS: paramString, ADD_RETURN: responseString });
			onSave && onSave(genSource, config, resourceConfig?.updatePosition);
		}
		onClose();
	};

	return (
		<>
			<SidePanel
				isOpen={isOpen}
				alignmanet="right"
				sx={{ width: 600 }}
			>
				<SidePanelTitleContainer>
					<Typography sx={{ margin: 0 }} variant="h3">Configure Resource</Typography>
					<Button onClick={onClose} appearance="icon">X</Button>
				</SidePanelTitleContainer>

				<SidePanelBody>
					<ResourcePath method={method} path={path} onChange={onPathChange} />

					<Divider />

					<Typography sx={{ marginBlockEnd: 10 }} variant="h4">Parameters</Typography>
					<ResourceParam parameters={parameters} onChange={handleParamChange} />
					{method !== HTTP_METHOD.GET && <Payload parameter={payload} onChange={handlePayloadChange} />}
					<AdvancedParamTitleWrapper>
						<Typography sx={{ marginBlockEnd: 10 }} variant="h4">Advanced Parameters</Typography>
						<LinkButton sx={{ marginTop: 12, marginLeft: 8 }} onClick={handleAdvanceParamToggle}> {showAdvanced ? "Hide" : "Show"} </LinkButton>
					</AdvancedParamTitleWrapper>
					{showAdvanced && <AdvancedParams parameters={advancedParams} onChange={handleAdvancedParamChange} />}
					
					<Divider />

					<Typography sx={{ marginBlockEnd: 10 }} variant="h4">Responses</Typography>
					<ResourceResponse method={method} addNameRecord={addNameRecord} response={response} onChange={handleResponseChange} serviceEndPosition={serviceEndPosition} commonRpcClient={commonRpcClient} isBallerniaExt={isBallerniaExt} applyModifications={applyModifications}/>

					<ActionButtons
						primaryButton={{ text: "Save", onClick: handleSave, tooltip: "Save" }}
						secondaryButton={{ text: "Cancel", onClick: onClose, tooltip: "Cancel" }}
						sx={{ justifyContent: "flex-end" }}
					/>
				</SidePanelBody>

			</SidePanel>
		</>
	);
}
