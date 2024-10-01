/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// import React from "react";
import React from "react";
import { OpenAPI } from "../../Definitions/ServiceDefinitions";
import petstoreJSON from "./Data/petstore.json";
import coffeshop from "./Data/coffeShop.json";
import { OpenAPIDefinition } from "./OpenAPIDefinition";
import { convertOpenAPItoService } from "../Utils/OpenAPIUtils";

export default {
    component: OpenAPIDefinition,
    title: 'API Designer',
};

const apiDefinition: OpenAPI = petstoreJSON as unknown as OpenAPI;
const apiDefinitionServiceDesModel = convertOpenAPItoService(apiDefinition);

const onOpenAPIDefinitionChange = (openAPIDefinition: OpenAPI) => {
    console.log(openAPIDefinition);
}

export const APIDesignerStory = () => {
    return (
        <OpenAPIDefinition
            openAPIDefinition={apiDefinition}
            onOpenApiDefinitionChange={onOpenAPIDefinitionChange}
            serviceDesModel={apiDefinitionServiceDesModel}
        />
    );
};

// Write a new Story for the Coffeeshop component
const coffeeshopJSON = coffeshop as unknown as OpenAPI;
const coffeeshopServiceDesModel = convertOpenAPItoService(coffeeshopJSON);
export const CoffeeshopStory = () => {
    return (
        <OpenAPIDefinition
            openAPIDefinition={coffeeshopJSON}
            serviceDesModel={coffeeshopServiceDesModel}
            onOpenApiDefinitionChange={onOpenAPIDefinitionChange}
        />
    );
}
