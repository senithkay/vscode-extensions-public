/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { assign, createMachine, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { activateProjectExplorer } from './project-explorer/activate';
import { extension } from './eggplantExtentionContext';

interface MachineContext {
    isEggplant: boolean;
}

const stateMachine = createMachine<MachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxBAPY5jE4BujA1qwMYAWYXlwAKAJ0YArIXgDaABgC6iUGkawyRZipAAPRACZ5ANgLyArABZjADgDMNmwYDsBp3YA0IAJ6IAjBYEAJwhQTZ+xs7GbpE2AL5xXijo2PhsmpQ09GBiEmIEmFh4AGaMYgC2BAJCohLSvHJKOmoa5NpIeoZB8gTGls5+lpaDfnZDds5evggG5s4EdvKjfn4h5qsmlglJqIVpaHUyACJgeDKQdArKHS2a7aD6COYGU4gD893RQQHOzmFW23Au1ShAAMgBlACSpDwDGYrBInB4BGSezBUJhCERjF4RS0OCuV2a6juOB0jzsdiCBBs3QGFgm5lpg1eCGMEQI-WMTMWziWQQMxkBqJBBAh0LIdByeQK2BKZUqItw6IleCxHBxeOYhKaNxJbTJHQpVJpdIC5kZzMsrL51MsBiCAzsfSCdis5mFwOVBDEYCwEG8BHYRDAAHcAEp+gN0ADyIgAogA5AD6ADVIfGAOpEvWtfHkxA2cx2ynOZ3mKwRe2s8x9AiDB1+WnyWkDLaJIEpb2+-2B4NhgCqaAgRXoTBYbCRrCVaR7AaDIdDQ5HZ3VnFxBp111U+vzRsLBj8BGcTICDtdxnk1p8iH6dgIbnkjMsdgMlMsV4SHZwjAgcB0M54MSeb3J0CAALR+PMizrMYQSWI6fLOI4rKQSsD7yM4L4vrMfizPIBiel2aQkBkVC0MBpIFggYymqMtK0valLwayER2jY8jwXMlaCtyRFogUhwNCcZwNJAlEGtRiy9PB9gWARDqHi8N4QW+x6YS+rjyJh2m2B6HaAWKGJkBJe4PP4-RmEWQRwRWd4WsYrJwfeH7RMhxhuieQT6TsxGEHO0w7iBhrmWyZYPosl6eX4cycayDjmMeHEOBMdijJYjj8aKAULmGka9qZoGPK4R5viYT5zDFto1n8D42Oy7KrK43xZd2UZ9ouy6joVIVgeadrctpzrGB5ArKdMFY9JYzz2OYnFNnBzitWkEBELAWAAEYYOJuZUfuTzfMe3lFtNtYEUE8UGJYGGRNYHkce6X5xEAA */
    id: 'eggplant',
    initial: 'initialize',
    predictableActionArguments: true,
    context: {
        isEggplant: false
    },
    states: {
        initialize: {
            invoke: {
                src: checkIfEggplantProject,
                onDone: [
                    {
                        target: 'ready',
                        actions: assign({
                            isEggplant: (context, event) => event.data,
                        })
                    },
                ],
                onError: {
                    target: 'disabled'
                }
            }
        },
        ready: {
            entry: "activateExplorer"
        },
        disabled: {
            // define what should happen when the project is not detected
        },
    }
}, {
    actions: {
        activateExplorer: (context, event) => {
            activateProjectExplorer(extension.context, context.isEggplant);
        }
    },
});


// Create a service to interpret the machine
export const stateService = interpret(stateMachine);

// Define your API as functions
export const StateMachine = {
    initialize: () => stateService.start()
};


async function checkIfEggplantProject(): Promise<boolean> {
    let isEggplant = false;
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error("No workspace folders found");
        }
        // Assume we are only interested in the root workspace folder
        const rootFolder = workspaceFolders[0].uri.fsPath;
        const ballerinaTomlPath = path.join(rootFolder, 'Ballerina.toml');

        if (fs.existsSync(ballerinaTomlPath)) {
            const data = await fs.promises.readFile(ballerinaTomlPath, 'utf8');
            isEggplant = data.includes('eggplant');
        }
    } catch (err) {
        console.error(err);
    }
    return isEggplant;
}

