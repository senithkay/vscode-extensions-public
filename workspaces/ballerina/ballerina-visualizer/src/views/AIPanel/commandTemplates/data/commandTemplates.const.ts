/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { InputContent } from "../../components/AIChatInput/utils/inputUtils";
import { Command } from "../models/command.enum";
import { TemplateDefinition } from "../models/template.model";

export const WILDCARD_TEMPLATE_ID = 'wildcard';

// All command templates are defined here.
export const commandTemplates = {
    [Command.Generate]: [
        {
            id: WILDCARD_TEMPLATE_ID,
            text: '',
            placeholders: [],
        },
        {
            id: 'generate-code',
            text: 'generate code for the use-case: <usecase>',
            placeholders: [
                {
                    id: 'usecase',
                    text: '<usecase>',
                    multiline: true,
                }
            ],
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
                    multiline: false,
                }
            ],
        },
        {
            id: 'tests-for-function',
            text: 'generate tests for resource <method(space)path> function',
            placeholders: [
                {
                    id: 'methodPath',
                    text: '<method(space)path>',
                    multiline: false,
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
                    text: '<recordname(s)>',
                    multiline: false,
                },
                {
                    id: 'outputRecord',
                    text: '<recordname>',
                    multiline: false,
                },
                {
                    id: 'functionName',
                    text: '<functionname>',
                    multiline: false,
                },
            ],
        },
        {
            id: 'mappings-for-function',
            text: 'generate mappings for the <functionname> function',
            placeholders: [
                {
                    id: 'functionName',
                    text: '<functionname>',
                    multiline: false,
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
        {
            id: WILDCARD_TEMPLATE_ID,
            text: '',
            placeholders: [],
        },
    ],
    [Command.Ask]: [
        {
            id: WILDCARD_TEMPLATE_ID,
            text: '',
            placeholders: [],
        },
    ],
    [Command.NaturalProgramming]: [

    ],
    [Command.OpenAPI]: [
        {
            id: WILDCARD_TEMPLATE_ID,
            text: '',
            placeholders: [],
        },
    ],
} as const;

export type CommandTemplates = typeof commandTemplates;

// Natural Programming templates
export const NATURAL_PROGRAMMING_TEMPLATES: TemplateDefinition[] = [
    {
        id: 'code-doc-drift-check',
        text: 'Check drift between code and documentation',
        placeholders: [],
    },
    {
        id: 'generate-code-from-requirements',
        text: 'Generate code based on the requirements',
        placeholders: [],
    },
    {
        id: 'generate-test-from-requirements',
        text: 'Generate tests against the requirements',
        placeholders: [],
    },
    {
        id: 'generate-code-from-following-requirements',
        text: 'Generate code based on the following requirements: <requirements>',
        placeholders: [
            {
                id: 'requirements',
                text: '<requirements>',
                multiline: true,
            }
        ],
    },
];

// Suggested command templates are defined here.
export const suggestedCommandTemplates: InputContent[] = [
    {
        type: 'command-template',
        command: Command.Generate,
        templateId: WILDCARD_TEMPLATE_ID,
        text: 'write a hello world http service',
    },
    {
        type: 'command-template',
        command: Command.Ask,
        templateId: WILDCARD_TEMPLATE_ID,
        text: 'how to write a concurrent application?',
    },
];
