/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { MEDIATORS, NODE_GAP } from "../resources/constants";
import { getLogDescription } from "./template-engine/mustach-templates/core/log";
import { getFilterDescription } from "./template-engine/mustach-templates/filter/filter";
import { getPropertyDescription } from "./template-engine/mustach-templates/core/property";
import { getSwitchDescription } from "./template-engine/mustach-templates/filter/switch";
import { getSequenceDescription } from "./template-engine/mustach-templates/core/sequence";
import { getDataMapperDescription } from "./template-engine/mustach-templates/transformation/datamapper";
import { getDSCallDescription } from "./template-engine/mustach-templates/data/dataServiceCall";
import { getAggregateDescription } from "./template-engine/mustach-templates/eip/aggregate";
import { getTargetDescription } from "./template-engine/mustach-templates/advanced/clone";

export function getNodeIdFromModel(model: STNode, prefix?: string) {
    if (model.viewState?.id) {
        return model.viewState.id;
    }
    if (model && model.tag && model.range) {
        const id = `${model.tag}-${model.range.startTagRange.start.line}-${model.range.startTagRange.start.character}`;
        if (prefix) {
            return `${prefix}-${id}`;
        }
        return id;
    }
    return Date.now().toString();
}

export function getNodeDescription(name: string, stNode: any): string {
    if (stNode.description) {
        return stNode.description;
    }

    switch (name) {
        case "endpoint": {
            if (stNode.key) {
                return stNode.key;
            }
            if (stNode.type) {
                return stNode.type;
            }
            return;
        }
        case (MEDIATORS.FILTER): {
            return getFilterDescription(stNode);
        }
        case (MEDIATORS.LOG): {
            return getLogDescription(stNode);
        }
        case (MEDIATORS.PROPERTY): {
            return getPropertyDescription(stNode);
        }
        case (MEDIATORS.SEQUENCE): {
            if (stNode.tag === "target") {
                return getTargetDescription(stNode);
            }

            return getSequenceDescription(stNode);
        }
        case (MEDIATORS.SWITCH): {
            return getSwitchDescription(stNode);
        }
        case (MEDIATORS.DATAMAPPER): {
            return getDataMapperDescription(stNode);
        }
        case (MEDIATORS.DATASERVICECALL): {
            return getDSCallDescription(stNode);
        }
        case (MEDIATORS.AGGREGATE): {
            return getAggregateDescription(stNode);
        }
        default:
            return;
    }
}

export function getTextWidth(text: any, font?: any) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.font = font || getComputedStyle(document.body).font;

    return context.measureText(text).width + 5.34 + NODE_GAP.TEXT_NODE_GAP;
}
