/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
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
    /* padding: 20px;
    max-height: 90vh;
    overflow-y: auto; */
`;

export function APIDesigner(props: ServiceDesignerProps) {
    const { fileUri } = props;
    const { rpcClient } = useVisualizerContext();
    const [ apiDefinition, setApiDefinition ] = useState<OpenAPI | undefined>(undefined);
    const [ documentType, setDocumentType ] = useState<string | undefined>(undefined);
    const [ isNewFile, setIsNewFile ] = useState<boolean>(false);

    const handleOpenApiDefinitionChange = async (openApiDefinition: OpenAPI) => {
        const resp = await rpcClient.getApiDesignerVisualizerRpcClient().writeOpenApiContent({
            filePath: fileUri,
            content: JSON.stringify(openApiDefinition),
        });
        if (resp.success) {
            setApiDefinition(openApiDefinition);
            // const serDesModel = convertOpenAPItoService(openApiDefinition);
            // setServiceDesModel(serDesModel);
        }
    };
    const debouncedOpenApiDefinitionChange = debounce(handleOpenApiDefinitionChange, 300);

    useEffect(() => {
        const fetchData = async () => {
            const resp = await rpcClient.getApiDesignerVisualizerRpcClient().getOpenApiContent({
                filePath: fileUri,
            });
            console.log("resp", resp);
            let convertedApiDefinition = convertOpenAPIStringToOpenAPI(resp.content, resp.type);
            // let serDesModel: Service | undefined;
            // if (convertedApiDefinition) {
            //     serDesModel = convertOpenAPIStringToObject(resp.content, resp.type);
            // }
            // setServiceDesModel(serDesModel);
            // If openapi field is not present in the response, then set the openapi field to the convertedApiDefinition
            if (!convertedApiDefinition) {
                convertedApiDefinition = {
                    openapi: "3.0.1",
                    info: {
                        title: "",
                        version: "",
                    },
                    paths: {},
                };
                setIsNewFile(true);
            }
            // If no Info field is present in the response, then set the Info field
            if (!convertedApiDefinition.info) {
                convertedApiDefinition.info = {
                    title: "",
                    version: "",
                };
            }
            setApiDefinition(convertedApiDefinition);
            setDocumentType(resp.type);
        };
        fetchData();
    }, [fileUri]);
    console.log("isNewFile", isNewFile);
    return (
        <APIDesignerWrapper>
            <OpenAPIDefinition openAPIDefinition={apiDefinition} isNewFile={isNewFile} onOpenApiDefinitionChange={debouncedOpenApiDefinitionChange} />
        </APIDesignerWrapper>
    )
}
