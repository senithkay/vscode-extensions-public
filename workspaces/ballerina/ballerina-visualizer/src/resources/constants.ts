/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { TRIGGER_CHARACTERS } from "@wso2-enterprise/ballerina-core";

// sizing
export const NODE_WIDTH = 280;
export const NODE_HEIGHT = 50;

export const LABEL_HEIGHT = 20;

export const NODE_BORDER_WIDTH = 1.8;

export const NODE_PADDING = 8;

// regex
export const FUNCTION_REGEX = new RegExp(
    `(?<label>[a-zA-Z0-9_'${TRIGGER_CHARACTERS.map((c) => `\\${c}`).join("")}]+)\\((?<args>.*)\\)$`
);
