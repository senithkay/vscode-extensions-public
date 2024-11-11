/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { OpenAPI as O } from '../../../Definitions/ServiceDefinitions';
import { Overview } from '../Overview/Overview';
import { Paths } from '../Paths/Paths';
import { SchemaEditor } from '../../SchemaEditor/SchemaEditor';

interface OverviewProps {
    openAPI: O;
    selectedComponent: string;
    onOpenAPIChange: (openAPIDefinition: O) => void;
}

// Path parent component is represented with paths-component-path-method, 
// Overview is represented with overview-component,
// Schema is represented with schema-component-schema
export function OpenAPI(props: OverviewProps) {
    const { openAPI, selectedComponent, onOpenAPIChange } = props;
    const componetName = selectedComponent.split("-")[0];

    const handleOpenAPIChange = (openAPI: O) => {
        onOpenAPIChange(openAPI);
    };

    return (
        <>
            {componetName === "overview" && (
                <Overview openAPIDefinition={openAPI} onOpenApiDefinitionChange={handleOpenAPIChange} />
            )}
            {componetName === "paths" && (
                <Paths 
                    paths={openAPI.paths} 
                    selectedComponent={selectedComponent}
                    onPathsChange={(paths) => handleOpenAPIChange({ ...openAPI, paths })}
                />
            )}
            {componetName === "schemas" && (
                <SchemaEditor
                    openAPI={openAPI}
                    schema={openAPI.components.schemas[selectedComponent.split("-")[2]]}
                    schemaName={selectedComponent.split("-")[2]}
                    onSchemaChange={
                        (schema) => handleOpenAPIChange({ 
                            ...openAPI, components: { 
                                ...openAPI.components, schemas: { 
                                    ...openAPI.components.schemas, [selectedComponent.split("-")[2]]: schema 
                                } 
                            } 
                        }
                    )
                }
                />
            )}
        </>
    )
}
