/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { SuggestionItem } from "../../../models/definitions";

import { FunctionParameter } from "./ParameterEditor/ParameterField";

export function getFilteredCompletions(completions: SuggestionItem[]) {
    return completions ? completions.filter((completion) => completion.kind !== "Module") : [];
}

export function getParametersAsString(parameters: (FunctionParameter | { name: string; type: string })[]) {
    return parameters
        .map((item: FunctionParameter) => `${item.type} ${item.name} ${item.defaultValue ? `= ${item.defaultValue}` : ""}`)
        .join(", ");
}
