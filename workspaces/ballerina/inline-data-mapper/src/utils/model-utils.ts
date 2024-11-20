/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { IDMModel, IOType } from "@wso2-enterprise/ballerina-core";
import { BaseVisitor } from "../visitors/BaseVisitor";

export function traverseNode(model: IDMModel, visitor: BaseVisitor) {
    visitor.beginVisit?.(model);

    // Visit input types
    if (model.mappings.inputs.length > 0) {
        for (const inputType of model.mappings.inputs) {
            traverseIOType(inputType, model, visitor);
        }
    }

    // Visit output type
    traverseIOType(model.mappings.output, model, visitor);

    // Visit mappings
    for (const mapping of model.mappings.mappings) {
        visitor.beginVisitMapping?.(mapping, model);
        visitor.endVisitMapping?.(mapping, model);
    }

    visitor.endVisit?.(model);
}

function traverseIOType(ioType: IOType, parent: IDMModel, visitor: BaseVisitor) {
    if (!!ioType.category) {
        visitor.beginVisitInputType?.(ioType, parent);
        visitor.endVisitInputType?.(ioType, parent);
    } else {
        visitor.beginVisitOutputType?.(ioType, parent);
        visitor.endVisitOutputType?.(ioType, parent);
    }
}
