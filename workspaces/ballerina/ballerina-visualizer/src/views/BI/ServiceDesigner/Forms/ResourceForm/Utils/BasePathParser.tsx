/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import { readUnquoted } from './ResourcePathParser';

export interface ParseError {
    position: number;
    message: string;
}

export interface ParseResult {
    valid: boolean;
    errors: ParseError[];
}

export function parseBasePath(input: string): ParseResult {
    const result: ParseResult = {
        valid: false,
        errors: []
    };

    if (!input || input === '') {
        result.valid = false;
        result.errors.push({ position: 0, message: 'base path cannot be empty' });
        return result;
    }

    // need to handle string literals
    if (input.startsWith('"')) {
        if (!input.endsWith('"')) {
            result.errors.push({ position: 0, message: 'string literal must end with a double quote' });
            return result;
        }
        result.valid = true;
        return result;
    }

    if (!input.startsWith('/')) {
        result.errors.push({ position: 0, message: 'base path must start with a slash (/) character' });
        return result;
    }

    if (input.includes('//')) {
        result.errors.push({ position: 0, message: 'cannot have two consecutive slashes (//)' });
        return result;
    }

    const segments = splitSegments(input);
    for (const segment of segments) {
        processBasePathSegment(segment, result);
    }
    return result;
}

function processBasePathSegment(
    segment: { value: string; start: number; end: number },
    result: ParseResult
) {
    const tokenResult = tokenize(segment.value, segment.start);
    result.errors.push(...tokenResult.errors);
    
    if (tokenResult.tokens.length !== 1) {
        result.errors.push({
            position: segment.start,
            message: `Invalid segment: ${segment.value}`
        });
        return;
    }
}

// Helper functions and tokenization implementation

interface Token {
    value: string;
    start: number;
    end: number;
}

function splitSegments(input: string): Array<{ value: string; start: number; end: number }> {
    const segments = [];
    let start = 0;
    let current = 0;
    
    while (current < input.length) {
        if (input[current] === '/') {
            if (start !== current) {
                segments.push({
                    value: input.substring(start, current),
                    start,
                    end: current - 1
                });
            }
            start = current + 1;
        }
        current++;
    }
    
    if (start < current) {
        segments.push({
            value: input.substring(start, current),
            start,
            end: current - 1
        });
    }
    
    return segments;
}

function tokenize(content: string, offset: number): { tokens: Token[]; errors: ParseError[] } {
    const tokens: Token[] = [];
    const errors: ParseError[] = [];
    let pos = 0;

    while (pos < content.length) {
        const start = pos + offset;
        const c = content[pos];

        if (/\s/.test(c)) {
            pos++;
            continue;
        }

        const { value, newPos, error } = readUnquoted(content, pos, offset);
        pos = newPos;
        if (error) errors.push(error);
        if (value !== null) tokens.push({ value, start, end: pos + offset - 1 });
        
    }

    return { tokens, errors };
}
