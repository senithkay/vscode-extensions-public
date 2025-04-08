/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Command } from "../models/command.enum";

export const commandTemplates = {
    [Command.Generate]: [
        {
            id: 'generate-code',
            text: 'generate code for the use-case: ',
            placeholders: [],
        },
        {
            id: 'generate-from-readme',
            text: 'generate an integration according to the given Readme file',
            placeholders: [],
        },
    ],
    [Command.Tests]: [
        {
            id: 'tests-for-service',
            text: 'generate tests for <servicename> service',
            placeholders: [
                {
                    id: 'servicename',
                    text: '<servicename>',
                }
            ],
        },
        {
            id: 'tests-for-function',
            text: 'generate tests for resource <method(space)path> function',
            placeholders: [
                {
                    id: 'methodPath',
                    text: '<method(space)path>'
                }
            ],
        },
    ],
    [Command.DataMap]: [
        {
            id: 'mappings-for-records',
            text: 'generate mappings using input as <recordname(s)> and output as <recordname> using the <functionname> function',
            placeholders: [
                {
                    id: 'inputRecords',
                    text: '<recordname(s)>'
                },
                {
                    id: 'outputRecord',
                    text: '<recordname>'
                },
                {
                    id: 'functionName',
                    text: '<functionname>'
                },
            ],
        },
        {
            id: 'mappings-for-function',
            text: 'generate mappings for the <functionname> function',
            placeholders: [
                {
                    id: 'functionName',
                    text: '<functionname>'
                }
            ],
        },
    ],
    [Command.TypeCreator]: [
        {
            id: 'types-for-attached',
            text: 'generate types using the attatched file',
            placeholders: []
        }
    ],
    [Command.Healthcare]: [

    ],
    [Command.Ask]: [

    ],
    [Command.NaturalProgramming]: [

    ],
    [Command.OpenAPI]: [

    ],
} as const;

export type CommandTemplates = typeof commandTemplates;
