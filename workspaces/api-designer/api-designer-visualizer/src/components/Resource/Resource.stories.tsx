/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { OpenAPI, PathItem, Operation } from "../../Definitions/ServiceDefinitions";
import petstoreJSON from "./Data/petstore.json";
import { Resource } from "./Resource";
import styled from "@emotion/styled";

export default {
    component: Resource,
    title: 'Resource',
};

const Container = styled.div`
    min-height: 500px;
`;

const apiDefinition: OpenAPI = petstoreJSON as unknown as OpenAPI;
// Extract the first PathItem from the OpenAPI object
const pathKeys = Object.keys(apiDefinition.paths);
const pathKey = pathKeys[1]; // Get the second key
const pathItem: PathItem = apiDefinition.paths[pathKey] as PathItem; // Ensure it's treated as PathItem
const path: string = pathKey;
const getOperation: Operation = pathItem.get as Operation; 

export const APIDesignerStory = () => {
    return (
        <Container>
            <Resource openAPI={apiDefinition} resourceOperation={getOperation} method="get" path={path} onOperationChange={() => {}} />
        </Container>
    );
};
