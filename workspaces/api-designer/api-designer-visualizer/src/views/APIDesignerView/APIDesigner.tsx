/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Service, ServiceDesigner } from "@wso2-enterprise/service-designer";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";
import { convertOpenAPIStringToOpenAPI } from "../../components/Utils/OpenAPIUtils";
import styled from "@emotion/styled";
import { OpenAPI } from "../../Definitions/ServiceDefinitions";
import { OpenAPIDefinition } from "../../components/OpenAPIDefinition/OpenAPIDefinition";
import { debounce } from "lodash";

interface ServiceDesignerProps {
    fileUri: string;
}

// Add emotional styling to the component
const APIDesignerWrapper = styled.div`
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
`;

export function APIDesigner(props: ServiceDesignerProps) {
    const { fileUri } = props;
    const { rpcClient } = useVisualizerContext();
    const [ apiDefinition, setApiDefinition ] = useState<OpenAPI | undefined>(undefined);

    const handleOpenApiDefinitionChange = async (openApiDefinition: OpenAPI) => {
        const resp = await rpcClient.getApiDesignerVisualizerRpcClient().writeOpenApiContent({
            filePath: fileUri,
            content: JSON.stringify(openApiDefinition),
        });
    };
    const debouncedOpenApiDefinitionChange = debounce(handleOpenApiDefinitionChange, 1000);

    useEffect(() => {
        const fetchData = async () => {
            const resp = await rpcClient.getApiDesignerVisualizerRpcClient().getOpenApiContent({
                filePath: fileUri,
            });
            console.log("resp", resp);
            const convertedApiDefinition = convertOpenAPIStringToOpenAPI(resp.content, resp.type);
            console.log("convertedApiDefinition", convertedApiDefinition);
            setApiDefinition(convertedApiDefinition);
        };
        fetchData();
    }, [fileUri]);
    console.log("Parent", apiDefinition);
    return (
        <APIDesignerWrapper>
            {/* <ServiceDesigner model={apiDefinition} disableServiceHeader /> */}
            <OpenAPIDefinition openAPIDefinition={apiDefinition} onOpenApiDefinitionChange={debouncedOpenApiDefinitionChange} />
        </APIDesignerWrapper>
    )
}
