/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { OpenAPI as O, Parameter, ReferenceObject, RequestBody, Response } from '../../../Definitions/ServiceDefinitions';
import { Overview } from '../Overview/Overview';
import { Paths } from '../Paths/Paths';
import { SchemaEditor } from '../../SchemaEditor/SchemaEditor';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../NewAPIDesignerContext';
import { RefParameter } from '../RefParameter/RefParameter';
import { RefRequestBody } from '../RefRequestBody/RefRequestBody';
import { RefResponse } from '../RefResponse/RefResponse';

interface OverviewProps {
    openAPI: O;
    onOpenAPIChange: (openAPIDefinition: O) => void;
}

// Path parent component ID is represented with paths#-component#-${path},
// Method component ID is represented with paths#-component#-${path}#-${method},
// Overview component ID is represented with overview#-component,
// Schema component ID is represented with schema#-component#-schema
export function OpenAPI(props: OverviewProps) {
    const { openAPI, onOpenAPIChange } = props;
    const {
        props: { selectedComponentID },
        api: { onSelectedComponentIDChange }
    } = useContext(APIDesignerContext);
    const componetName = selectedComponentID.split("#-")[0];

    const handleOpenAPIChange = (openAPI: O) => {
        onOpenAPIChange(openAPI);
    };
    const handleRequestBodiesChange = (requestBody: RequestBody | ReferenceObject, name: string, initialName: string) => {
        const updatedOpenAPI = { ...openAPI };
        const requestBodies = { ...updatedOpenAPI.components.requestBodies };
        // Create new object maintaining order and replacing the key
        const orderedRequestBodies = Object.fromEntries(
            Object.entries(requestBodies).map(([key, value]) => 
                key === initialName ? [name, requestBody] : [key, value]
            )
        );
        updatedOpenAPI.components.requestBodies = orderedRequestBodies as RequestBody;
        if (initialName !== name) {
            onSelectedComponentIDChange(`requestBody#-component#-${name}`);
        }
        handleOpenAPIChange(updatedOpenAPI);
    };
    const handleParameterChange = (parameter: Parameter, name: string, initialName?: string) => {
        const updatedOpenAPI = { ...openAPI };
        const parameters = { ...updatedOpenAPI.components.parameters };
        // Create new object maintaining order and replacing the key
        const orderedParameters = Object.fromEntries(
            Object.entries(parameters).map(([key, value]) => 
                key === initialName ? [name, parameter] : [key, value]
            )
        );
        updatedOpenAPI.components.parameters = orderedParameters;
        if (initialName !== name) {
            onSelectedComponentIDChange(`parameters#-component#-${name}`);
        }
        handleOpenAPIChange(updatedOpenAPI);
    };
    const handleResponseChange = (response: Response, name: string, initialName?: string) => {
        const updatedOpenAPI = { ...openAPI };
        const responses = { ...updatedOpenAPI.components.responses };
        // Create new object maintaining order and replacing the key
        const orderedResponses = Object.fromEntries(
            Object.entries(responses).map(([key, value]) => 
                key === initialName ? [name, response] : [key, value]
            )
        );
        updatedOpenAPI.components.responses = orderedResponses;
        if (initialName !== name) {
            onSelectedComponentIDChange(`responses#-component#-${name}`);
        }
        handleOpenAPIChange(updatedOpenAPI);
    };


    return (
        <>
            {componetName === "overview" && (
                <Overview openAPIDefinition={openAPI} onOpenApiDefinitionChange={handleOpenAPIChange} />
            )}
            {componetName === "paths" && (
                <Paths 
                    paths={openAPI.paths} 
                    onPathsChange={(paths) => handleOpenAPIChange({ ...openAPI, paths })}
                />
            )}
            {componetName === "schemas" && (
                <SchemaEditor
                    openAPI={openAPI}
                    schema={openAPI.components.schemas[selectedComponentID.split("#-")[2]]}
                    schemaName={selectedComponentID.split("#-")[2]}
                    onSchemaChange={
                        (schema) => handleOpenAPIChange({ 
                            ...openAPI, components: { 
                                ...openAPI.components, schemas: { 
                                    ...openAPI.components.schemas, [selectedComponentID.split("#-")[2]]: schema 
                                } 
                            } 
                        }
                    )
                }
                />
            )}
            {componetName === "parameters" && (
                <RefParameter
                    paramerName={selectedComponentID.split("#-")[2]}
                    parameter={openAPI.components.parameters[selectedComponentID.split("#-")[2]]}
                    onParameterChange={handleParameterChange}
                />
            )}
            {componetName === "requestBody" && (
                <RefRequestBody
                    requestBodyName={selectedComponentID.split("#-")[2]}
                    requestBody={openAPI.components.requestBodies[selectedComponentID.split("#-")[2]]}
                    onRequestBodyChange={handleRequestBodiesChange}
                />
            )}
            {componetName === "responses" && (
                <RefResponse
                    responseName={selectedComponentID.split("#-")[2]}
                    response={openAPI.components.responses[selectedComponentID.split("#-")[2]]}
                    onResponseChange={handleResponseChange}
                />
            )}
        </>
    )
}
