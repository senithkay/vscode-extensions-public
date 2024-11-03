/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Button, Codicon, Dropdown, FormGroup, TextArea, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { useVisualizerContext } from '@wso2-enterprise/api-designer-rpc-client';
import { OpenAPI } from '../../../Definitions/ServiceDefinitions';

export const PanelBody = styled.div`
    height: calc(100% - 87px);
    overflow-y: auto;
    padding: 16px;
    gap: 15px;
    display: flex;
    flex-direction: column;
`;
export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const SubSectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 5px;
    gap: 5px;
`;

interface OverviewProps {
    openAPIDefinition: OpenAPI;
}

// Title, Vesrion are mandatory fields
export function Overview(props: OverviewProps) {
    const { openAPIDefinition } = props;
    const { rpcClient } = useVisualizerContext();
    
    return (
        <PanelBody>
            
        </PanelBody>
    )
}
