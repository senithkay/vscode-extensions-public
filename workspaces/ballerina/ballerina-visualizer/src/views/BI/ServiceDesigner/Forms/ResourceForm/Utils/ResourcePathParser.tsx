/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
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
