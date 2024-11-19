/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { OpenAPI as O } from '../../../Definitions/ServiceDefinitions';
import { useContext } from 'react';
import { APIDesignerContext } from '../../../NewAPIDesignerContext';
import { ReadOnlyPaths } from '../Paths/ReadOnlyPaths';
import { ReadOnlyOverview } from '../Overview/ReadOnlyOverview';
import { ReadOnlySchemaEditor } from '../../SchemaEditor/ReadOnlySchemaEditor';

interface OverviewProps {
    openAPI: O;
}

// Path parent component is represented with paths-component-path-method, 
// Overview is represented with overview-component,
// Schema is represented with schema-component-schema
export function ReadOnlyOpenAPI(props: OverviewProps) {
    const { openAPI } = props;
    const { 
        props: { selectedComponentID },
    } = useContext(APIDesignerContext);
    const componetName = selectedComponentID.split("-")[0];

    return (
        <>
            {componetName === "overview" && (
                <ReadOnlyOverview openAPIDefinition={openAPI} />
            )}
            {componetName === "paths" && (
                <ReadOnlyPaths 
                    paths={openAPI.paths} 
                />
            )}
            {componetName === "schemas" && (
                <ReadOnlySchemaEditor
                    schema={openAPI.components.schemas[selectedComponentID.split("-")[2]]}
                    schemaName={selectedComponentID.split("-")[2]}
                />
            )}
        </>
    )
}
