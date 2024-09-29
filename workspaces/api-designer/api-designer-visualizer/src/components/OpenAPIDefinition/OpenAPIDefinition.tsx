/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { useEffect, useState } from "react";
import { OpenAPI, Path } from "../../Definitions/ServiceDefinitions";
import { Codicon, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { PathsComponent } from "../PathsComponent/PathsComponent";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Overview } from "../Overview/Overview";
import { getMethodFromResourceID, getOperationFromOpenAPI, getPathFromResourceID, getPathParametersFromParameters, getResourceID } from "../Utils/OpenAPIUtils";
import { Resource } from "../Resource/Resource";
import { SplitView } from "../SplitView/SplitView";

interface OpenAPIDefinitionProps {
    openAPIDefinition: OpenAPI;
}

const NavigationContainer = styled.div`
    padding: 10px;
    max-height: 90vh;
    overflow-y: auto;
`;

// const PanelContainer = styled.div`
//     background-color: var(--vscode-editor-background);
//     box-shadow: 5px 5px 10px 5px var(--vscode-badge-background);
//     width: 900px; // Adjust width as needed
//     padding: 10px;
//     position: absolute; // Position it absolutely
//     right: 0; // Align to the right
//     top: 25px; // Align to the top
//     height: 100%; // Full height
//     overflow-y: auto; // Enable scrolling if content overflows
//     z-index: 1;
// `;

const schema = yup.object({
    title: yup.string(),
    version: yup.string(),
    selectedPathID: yup.string()
});

const NvigationPanelContainer = styled.div`
    padding: 10px;
`;

export function OpenAPIDefinition(props: OpenAPIDefinitionProps) {
    const { openAPIDefinition: initialOpenAPIDefinition } = props;
    const [openAPIDefinition, setOpenAPIDefinition] = useState<OpenAPI>(initialOpenAPIDefinition);
    const [selectedPathID, setSelectedPathID] = useState<string | undefined>(undefined);

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        getValues,
        setValue,
        control,
        watch,
    } = useForm({
        // defaultValues: null,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const handlePathClick = (pathID: string) => {
        setSelectedPathID(pathID);
    };

    const handlePathChange = (path: Path) => {
        // Update the OpenAPI definition with the new path
        const initialPath = Object.keys(openAPIDefinition.paths).find((key) => key === path.initialPath);
        const initialPathItems = initialPath && openAPIDefinition.paths[initialPath];
        let updatedOpenAPIDefinition = { ...openAPIDefinition };
        const initialPathParamaters = getPathParametersFromParameters(openAPIDefinition.paths[path.initialPath][path.initialMethod].parameters);
        const newPathParameters = getPathParametersFromParameters(path.initialOperation.parameters);
        if (initialPathParamaters?.length === newPathParameters?.length) {
            // Update the existing path
            const initialPathItem = initialPathItems && initialPathItems[path.method];
            // Update the currentPathItem directly
            if (initialPathItem) {
                // If updatedOpenAPIDefinition.paths[path.path] does not exist, create it delete the initial path
                if (!updatedOpenAPIDefinition.paths[path.path]) {
                    updatedOpenAPIDefinition.paths[path.path] = {
                        ...updatedOpenAPIDefinition.paths[path.initialPath]
                    };
                    delete updatedOpenAPIDefinition.paths[path.initialPath];
                }
                updatedOpenAPIDefinition.paths[path.path][path.method] = {
                    ...path.initialOperation // Update with new operation details
                };
            } else {
                if (updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod]) {
                    delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
                    // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
                    if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
                        delete updatedOpenAPIDefinition.paths[path.initialPath];
                    }
                }
                updatedOpenAPIDefinition.paths[path.path][path.method] = {
                    ...path.initialOperation
                };
            }
        } else {
            // If the method does not exist, add it
            if (updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod]) {
                delete updatedOpenAPIDefinition.paths[path.initialPath][path.initialMethod];
                // Delete updatedOpenAPIDefinition.paths[path.initialPath] if it is empty
                if (Object.keys(updatedOpenAPIDefinition.paths[path.initialPath]).length === 0) {
                    delete updatedOpenAPIDefinition.paths[path.initialPath];
                }
            }
            // Add a new path
            updatedOpenAPIDefinition.paths[path.path] = {
                ...updatedOpenAPIDefinition.paths[path.path],
                [path.method]: {
                    ...path.initialOperation
                }
            };
        }
        setSelectedPathID(getResourceID(path.path, path.method));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
    };

    const handleAddPath = () => {
        // If Genetrate a new path with "path" prefix and 1,2,3 ... suffix if the path already exists
        const newPath = Object.keys(openAPIDefinition.paths).find((key) => key === "/path") ? `/path${Object.keys(openAPIDefinition.paths).length + 1}` : "/path";
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            paths: {
                ...openAPIDefinition.paths,
                [newPath]: {
                    get: {
                        summary: "",
                        description: "",
                        parameters: []
                    }
                }
            }
        };
        setSelectedPathID(getResourceID("/path", "get"));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
    };

    const handleAddResource = (path: string, method: string) => {
        // Get current path
        const currentPath = openAPIDefinition.paths[path];
        // Add a new method to the current path
        currentPath[method] = {
            summary: "",
            description: "",
            parameters: []
        };
        const updatedOpenAPIDefinition: OpenAPI = {
            ...openAPIDefinition,
            paths: {
                ...openAPIDefinition.paths,
                [path]: currentPath
            }
        };
        setSelectedPathID(getResourceID(path, method));
        setOpenAPIDefinition(updatedOpenAPIDefinition);
    };

    const onDeleteResource = (p: string, method: string) => {
        // If p with path and method exists, delete the perticular method
        if (openAPIDefinition.paths[p][method]) {
            delete openAPIDefinition.paths[p][method];
        }
        // If no more methods are available for the path, delete the path
        if (Object.keys(openAPIDefinition.paths[p]).length === 0) {
            delete openAPIDefinition.paths[p];
        }
        setSelectedPathID(undefined);
        setOpenAPIDefinition({ ...openAPIDefinition });
    };

    const onDeletePath = (p: string) => {
        // If p with path and method exists, delete the perticular method
        if (openAPIDefinition.paths[p]) {
            delete openAPIDefinition.paths[p];
            setOpenAPIDefinition({ ...openAPIDefinition });
        }
    };

    const selectedMethod = selectedPathID && getMethodFromResourceID(selectedPathID);
    const selectedPath = selectedPathID && getPathFromResourceID(selectedPathID);
    const operation = selectedPath && selectedMethod &&
        getOperationFromOpenAPI(selectedPath, selectedMethod, openAPIDefinition);

    useEffect(() => {
        setOpenAPIDefinition(initialOpenAPIDefinition);
    }, [initialOpenAPIDefinition]);

    return (
        <NavigationContainer>
            <SplitView defaultWidths={[25, 75]}>
                <NvigationPanelContainer>
                    {openAPIDefinition?.paths && 
                        <PathsComponent 
                            paths={openAPIDefinition.paths}
                            selectedPathID={selectedPathID}
                            onPathChange={handlePathClick}
                            onAddPath={handleAddPath}
                            onAddResource={handleAddResource}
                            onDeletePath={onDeletePath} />
                        }
                </NvigationPanelContainer>
                <div>
                    {(selectedPathID === undefined) && (
                        <Overview openAPIDefinition={openAPIDefinition} />
                    )}
                    {operation && selectedPathID !== undefined && (
                        <Resource resourceOperation={operation} method={selectedMethod} path={selectedPath} onPathChange={handlePathChange} onDelete={onDeleteResource} />
                    )}
                </div>
            </SplitView>
        </NavigationContainer>
    )
}
