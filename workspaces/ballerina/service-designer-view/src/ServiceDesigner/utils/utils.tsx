/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as Handlebars from 'handlebars';

export interface ResourceDefinition {
    METHOD: string;
    PATH: string;
    PARAMETERS: string;
    ADD_RETURN?: string;
}

export function generateResourceFunction(data: ResourceDefinition): string {
    // Your Handlebars template
    const templateString = `resource function {{{ METHOD }}} {{{ PATH }}} ( {{{ PARAMETERS }}} ) {{#if ADD_RETURN}}returns {{{ADD_RETURN}}}{{/if}} {}`;
    // Compile the template
    const compiledTemplate = Handlebars.compile(templateString);
    // Apply data to the template
    const resultString = compiledTemplate(data);
    return resultString;
}