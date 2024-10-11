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
import styled from "@emotion/styled";
import { Response } from "./Response";

export default {
    component: Response,
    title: 'Resource',
};

const Container = styled.div`
    min-height: 500px;
`;

const apiDefinition: OpenAPI = petstoreJSON as unknown as OpenAPI;
// Extract the first PathItem from the OpenAPI object
const pathItem: PathItem = apiDefinition.paths[Object.keys(apiDefinition.paths)[0]];
const path: string = Object.keys(apiDefinition.paths)[1];
const getOperation: Operation = pathItem.post;

export const ResponseStory = () => {
    return (
        <Container>
            <Response resourceOperation={getOperation} method="post" path={path} onOperationChange={() => {}} />
        </Container>
    );
};
