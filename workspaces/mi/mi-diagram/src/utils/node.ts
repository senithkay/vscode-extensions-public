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

    // TODO: Move to LS
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
            if (stNode.regex && stNode.source) {
                return `${stNode.source} matches ${stNode.regex}`;
            }
            if (stNode.regex) {
                return stNode.regex;
            } else if (stNode.source) {
                return stNode.source;
            } else if (stNode.xpath) {
                return stNode.xpath;
            }
            return;
        }
        case (MEDIATORS.LOG): {
            if (stNode.property) {
                return stNode.property.map((property: any) => {
                    return property.name;
                }).join(", ");
            }
            return;
        }
        case (MEDIATORS.PROPERTY): {
            if (stNode.name) {
                return stNode.name;
            }
            return;
        }
        case (MEDIATORS.SEQUENCE): {
            if (stNode.tag === "target") {
                return stNode.sequenceAttribute;
            }

            const description = stNode.staticReferenceKey || stNode.dynamicReferenceKey || stNode.key;
            if (description) {
                return description.split(".")[0];
            }
            return;
        }
        case (MEDIATORS.SWITCH): {
            return stNode.source;
        }
        case (MEDIATORS.DATAMAPPER): {
            const description = stNode.config;
            if (description) {
                const match = description.match(/\/([^\/]+)\.dmc$/);
                return match ? match[1] : null;
            }
            return;
        }
        case (MEDIATORS.DATASERVICECALL): {
            return stNode.serviceName;
        }
        case (MEDIATORS.AGGREGATE): {
            const onComplete = stNode?.correlateOnOrCompleteConditionOrOnComplete?.onComplete;
            const isSequnceReference = onComplete.sequenceAttribute !== undefined;

            return isSequnceReference ? onComplete.sequenceAttribute.split(".")[0] : undefined;
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
