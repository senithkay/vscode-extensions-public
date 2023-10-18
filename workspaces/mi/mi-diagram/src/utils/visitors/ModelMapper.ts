/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";

interface Node {
    attributes: {
        closed: boolean;
        hasDelimiter: boolean;
        name: string;
        nameTagOffOffset: number;
        nameTagOpenOffset: number;
        originalValue: string;
        quotelessValue: string;
        valueTagOffOffset: number;
        valueTagOpenOffset: number;
    }[],
    children: [],
    end: number,
    endTagOffOffset: number,
    endTagOpenOffset: number,
    hasTextNode: boolean,
    selfClosed: boolean,
    start: number,
    startTagOffOffset: number,
    startTagOpenOffset: number,
    tag: string
}

export function mapNode<T extends STNode>(node: Node): T | undefined {
    switch (node.tag) {
        case "log":
            return {
                property: node.attributes.map((attribute) => {
                    return {
                        name: attribute.name,
                        value: attribute.quotelessValue,
                        otherAttributes: attribute
                    }
                }),
                level: (node.attributes.find((attribute: any) => attribute.name === 'level') as any).quotelessValue,
                ...node
            } as any;
        default:
            return undefined;
    }
}