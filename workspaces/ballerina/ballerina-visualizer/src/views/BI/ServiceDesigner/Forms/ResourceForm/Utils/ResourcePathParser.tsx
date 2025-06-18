/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import { ParseResult, processSegment, splitSegments, processParam } from "@wso2-enterprise/ballerina-side-panel";

export function parseResourcePath(input: string): ParseResult {
    const result: ParseResult = {
        valid: false,
        errors: [],
        segments: []
    };

    if (!input || input === '') {
        result.valid = false;
        result.errors.push({ position: 0, message: 'path cannot be empty' });
        return result;
    }

    if (input === '.') {
        result.segments.push({ type: 'dot', start: 0, end: 0 });
        result.valid = result.errors.length === 0;
        if (!result.valid) {
            result.errors.push({ position: 0, message: 'cannot have charcaters after dot (.)' });
        }
        return result;
    }

    if (input.includes('//')) {
        result.errors.push({ position: 0, message: 'cannot have two consecutive slashes (//)' });
        return result;
    }

    const segments = splitSegments(input);
    for (const segment of segments) {
        if (segment.value.startsWith('[') || segment.value.endsWith(']')) {
            processParam(segment, result);
        } else {
            processSegment(segment, result);
        }
    }

    result.valid = result.errors.length === 0;
    return result;
}
