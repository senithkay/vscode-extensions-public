/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Range, TagRange } from '@wso2-enterprise/mi-syntax-tree/lib/src';

export interface AddMediatorProps {
    nodePosition: Range;
    documentUri: string;
}

export function getRangeFromTagRange(tagRange: any): Range {
    if (tagRange.start) {
        return tagRange as Range
    }
    tagRange = tagRange as TagRange;
    const start = { line: tagRange.startTagRange.start.line, character: tagRange.startTagRange.start.character };
    const end = tagRange.endTagRange.end ? { line: tagRange.endTagRange.end.line, character: tagRange.endTagRange.end.character } : { line: tagRange.startTagRange.end.line, character: tagRange.startTagRange.end.character };
    const range = {
        start: start,
        end: end
    }
    return range;
}

export function filterFormValues(formValues: { [key: string]: any }, keysToInclude: string[], keysToExclude: string[]): { [key: string]: any } {
    if (keysToInclude && keysToInclude.length > 0) {
        Object.keys(formValues).forEach(key => {
            if (!keysToInclude.includes(key)) {
                delete formValues[key];
            }
        });
    }
    if (keysToExclude && keysToExclude.length > 0) {
        Object.keys(formValues).forEach(key => {
            if (keysToExclude.includes(key)) {
                delete formValues[key];
            }
        });
    }
    return formValues;
}
