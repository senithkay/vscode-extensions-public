/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { IDMModel, InputType, OutputType } from "@wso2-enterprise/ballerina-core";
import { BaseVisitor } from "../visitors/BaseVisitor";

export function traverseNode(model: IDMModel, visitor: BaseVisitor) {
    visitor.beginVisit?.(model);

    // Visit input types
    for (const inputType of model.inputTypes) {
        traverseInputType(inputType, model, visitor);
    }

    // Visit output type
    traverseOutputType(model.outputType, model, visitor);

    visitor.endVisit?.(model);
}

function traverseInputType(inputType: InputType, parent: IDMModel, visitor: BaseVisitor) {
    visitor.beginVisitInputType?.(inputType, parent);
    visitor.endVisitInputType?.(inputType, parent);
}

function traverseOutputType(outputType: OutputType, parent: IDMModel, visitor: BaseVisitor) {
    visitor.beginVisitOutputType?.(outputType, parent);

    // Visit mappings if present
    if (outputType.mapping) {
        visitor.beginVisitMapping?.(outputType.mapping, parent);
        visitor.endVisitMapping?.(outputType.mapping, parent);
    }

    visitor.endVisitOutputType?.(outputType, parent);
}
