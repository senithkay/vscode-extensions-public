/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { ServiceDesigner } from ".";
import { ResourceInfo } from "./definitions";
import model from "./data/service.json";
import resourceInfo from "./data/resourceInfo.json";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

export default {
  component: ServiceDesigner,
  title: 'Service Designer',
};

const typeCompletions = ["int", "string", "float"];
const onSave = (resources: ResourceInfo) => {
  console.log(resources);
};
const onDeleteResource = (resources: ResourceInfo) => {
  console.log("Delete Resource ", resources);
};
const goToSource = (postion: NodePosition) => {
  console.log("Go to source ", postion);
};

export const EmptyModel = () => <ServiceDesigner typeCompletions={typeCompletions} onSave={onSave} />;

export const WithServiceDeclModel = () => <ServiceDesigner typeCompletions={typeCompletions} goToSource={goToSource} model={model as ServiceDeclaration} onSave={onSave} />;

export const WithSampleResourceModel = () => <ServiceDesigner typeCompletions={typeCompletions} goToSource={goToSource} model={resourceInfo as unknown as ResourceInfo[]} onDeleteResource={onDeleteResource} onSave={onSave} />;
