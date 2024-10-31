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
import { OpenAPI } from "../../Definitions/ServiceDefinitions";
import { OpenAPIDefinition } from "../../components/OpenAPIDefinition/OpenAPIDefinition";
import { debounce } from "lodash";
import { APIDesignerContext } from "../../APIDesignerContext";
import { Views } from "../../constants";

interface ServiceDesignerProps {
    fileUri: string;
}

export function APIDesigner(props: ServiceDesignerProps) {
    const { fileUri } = props;
    const { rpcClient } = useVisualizerContext();
    const [ apiDefinition, setApiDefinition ] = useState<OpenAPI | undefined>(undefined);
    const [ documentType, setDocumentType ] = useState<string | undefined>(undefined);
    const [ isNewFile, setIsNewFile ] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<Views>(isNewFile ? Views.EDIT : Views.READ_ONLY);
    const [selectedComponent, setSelectedComponent] = useState<string | undefined>(undefined);

    const handleOpenApiDefinitionChange = async (openApiDefinition: OpenAPI) => {
        const resp = await rpcClient.getApiDesignerVisualizerRpcClient().writeOpenApiContent({
            filePath: fileUri,
            content: JSON.stringify(openApiDefinition),
        });
        if (resp.success) {
            setApiDefinition(openApiDefinition);
        }
    };
    const debouncedOpenApiDefinitionChange = debounce(handleOpenApiDefinitionChange, 300);

    const contextValue = {
        props: {
            openAPIVersion: apiDefinition?.openapi || "3.0.1",
            openAPI: apiDefinition,
            selectedComponent,
            isNewFile,
            currentView,
        },
        api: {
            onOpenAPIDefinitionChange: (openAPI: OpenAPI, selectedComponent?: string, currentView?: Views) => {
                setApiDefinition(openAPI);
                if (selectedComponent) {
                    setSelectedComponent(selectedComponent);
                }
                if (currentView) {
                    setCurrentView(currentView);
                }
                debouncedOpenApiDefinitionChange(openAPI);
            },
            onSelectedComponentChange: (component: string) => {
                setSelectedComponent(component);
            },
            onCurrentViewChange: (view: Views) => {
                setCurrentView(view);
            },
        },
    };

    useEffect(() => {
        const fetchData = async () => {
            const resp = await rpcClient.getApiDesignerVisualizerRpcClient().getOpenApiContent({
                filePath: fileUri,
            });
            let convertedApiDefinition = convertOpenAPIStringToOpenAPI(resp.content, resp.type);
            if (!convertedApiDefinition) {
                convertedApiDefinition = {
                    openapi: "3.0.1",
                    info: {
                        title: "",
                        version: "",
                    },
                    paths: {},
                };
                setCurrentView(Views.EDIT);
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
    return (
        <APIDesignerContext.Provider value={contextValue}>
            <OpenAPIDefinition />
        </APIDesignerContext.Provider>
    )
}
