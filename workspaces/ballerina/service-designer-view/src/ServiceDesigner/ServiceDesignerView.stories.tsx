/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Resource, Service } from "./definitions";
import serviceModel from "./data/serviceST.json";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { ServiceDesignerView } from "./ServiceDesignerView";

export default {
    component: ServiceDesignerView,
    title: 'Service Designer',
};

const typeCompletions = ["int", "string", "float"];
const onSave = (resources: Resource) => {
    console.log(resources);
};
const onDeleteResource = (resources: Resource) => {
    console.log("Delete Resource ", resources);
};
const goToSource = (postion: NodePosition) => {
    console.log("Go to source ", postion);
};
const onServiceSave = (service: Service) => {
    console.log("Service save ", service);
};

export const EmptyModel = () => <ServiceDesignerView typeCompletions={typeCompletions} onResourceSave={onSave} />;

export const WithSampleResourceModel = () => <ServiceDesignerView typeCompletions={typeCompletions} goToSource={goToSource} model={serviceModel as unknown as ServiceDeclaration} onServiceSave={onServiceSave} onResourceDelete={onDeleteResource} onResourceSave={onSave} />;
