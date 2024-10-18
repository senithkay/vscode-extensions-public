/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { OpenAPI, Paths } from "../../Definitions/ServiceDefinitions";
import { PathItem } from "./PathItem.tsx";

import petstoreJSON from "../OpenAPIDefinition/Data/petstore.json";
import { useState } from "react";
const apiDefinition: OpenAPI = petstoreJSON as unknown as OpenAPI;
const getPathItem: Paths = apiDefinition.paths
export default {
    component: PathItem,
    title: 'PathItem',
};

const Container = styled.div`
    min-height: 500px;
`;

export const PathItemStory = () => {
    const [path, setPath] = useState<Paths>(getPathItem);
    const [p, setP] = useState<string>('/pets');
    const handleChange = (paths: Paths, p: string) => {
        setPath(paths);
        setP(p);
    };
    return (
        <Container>
            <PathItem pathItem={path} path={p} onChange={handleChange} />
        </Container>
    );
};
