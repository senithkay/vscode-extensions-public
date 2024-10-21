/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { ActionButtons, Button, Divider, LinkButton, SidePanel, SidePanelBody, SidePanelTitleContainer, Typography, ProgressIndicator, TextField, FormContainer } from '@wso2-enterprise/ui-toolkit';
// import { ResourcePath } from '../ResourcePath/ResourcePath';
// import { ResourceResponse } from '../ResourceResponse/ResourceResponse';
// import { ResourceParam } from '../ResourceParam/ResourceParam';
// import { Payload } from '../Payload/Payload';
// import { AdvancedParams } from '../AdvancedParam/AdvancedParam';
import styled from '@emotion/styled';
// import { HTTP_METHOD, generateNewResourceFunction, updateResourceFunction } from '../../utils/utils';
import { NodePosition } from '@wso2-enterprise/syntax-tree';
// import { PARAM_TYPES, ParameterConfig, Resource, ResponseConfig } from '@wso2-enterprise/service-designer';
import { CommonRPCAPI, ConfigVariable, STModification } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { debounce } from "lodash";
import { Colors } from '../../../../resources/constants';
import { PanelContainer, Form} from '@wso2-enterprise/ballerina-side-panel';
// import { useServiceDesignerContext } from '../../Context';

// const FormTextInputContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 4px;
// `;
// const FormTextInputContainer = styled.div`
//     display: flex;
//     flex-direction: column;
//     gap: 4px;
// `;

namespace S {
    export const FormContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: inherit;
    `;
}

export interface ConfigFormProps {
	isOpen: boolean;
    onClose: () => void;
    onSave?: (source: string, config: ConfigVariable, updatePosition?: NodePosition) => void;
    variable: ConfigVariable;
}

export function EditForm(props: ConfigFormProps) {
	const { isOpen, onClose, variable } = props;

	// Map variables data to form fields
	const formFields = [
		{
		  key: `variable-${variable?.properties?.variable?.value || ''}`,
		  label: 'Variable',
		  type: 'string',
		  optional: false,
		  editable: true,
		  documentation: '',
		  value: variable?.properties?.variable?.value || ''
		},
		{
		  key: `type-${variable?.properties?.type?.value || ''}`,
		  label: 'Type',
		  type: 'string',
		  optional: false,
		  editable: true,
		  documentation: '',
		  value: variable?.properties?.type?.value || ''
		},
		{
		  key: `defaultable-${variable?.properties?.defaultable?.value || ''}`,
		  label: 'Value',
		  type: 'string',
		  optional: false,
		  editable: true,
		  documentation: '',
		  value: variable?.properties?.defaultable?.value === '' ? '' : variable?.properties?.defaultable?.value || ''
		}
	  ];
	  

    const handleSave = () => {
        console.log("Save");
        
		// const genSource = generateSource();
		// const config = {
		// 	methods: [method],
		// 	path: path,
		// 	params: parameters,
		// 	advancedParams: advancedParams,
		// 	payloadConfig: payload,
		// 	responses: response
		// };
		// // Insert scenario
		// if (!resourceConfig?.updatePosition) {
		// 	// Insert scenario
		// 	onSave && onSave(genSource, config);
		// } else {
		// 	// Edit scenario
		// 	onSave && onSave(genSource, config, resourceConfig?.updatePosition);
		// }
		onClose();
	};

	return (
		<>
			<PanelContainer 
				title='Edit Config Variable'
				show={props.isOpen} 
				onClose={onClose}>

					<Form formFields={formFields} onSubmit={handleSave}/>
                
			</PanelContainer>
		</>
	);
}
