import { MachineStateValue, VisualizerLocation, EventType, MachineViews } from '@wso2-enterprise/eggplant-core';
import { createMachine, interpret } from 'xstate';
import * as vscode from 'vscode';
import * as fs from 'fs';

interface Context extends VisualizerLocation {
    errorCode: string | null;
}

const stateMachine = createMachine<Context>({
    /** @xstate-layout N4IgpgJg5mDOIC5RilADgGwIYDsAuAdAJY5F5FYZEBeYAxBAPY5jE4BujA1qwMYAWYXlwAKAJ0YArIXgDaABgC6iUGkawyRZipAAPRACZ5ANgLyArABZjADgDMNmwYDsBp3YA0IAJ6IAjBYEAJwhQTZ+xs7GbpE2AL5xXijo2PhsmpQ09GBiEmIEmFh4AGaMYgC2BAJCohLSvHJKOmoa5NpIeoZB8gTGls5+lpaDfnZDds5evggG5s4EdvKjfn4h5qsmlglJqIVpaHUyACJgeDKQdArKHS2a7aD6COYGU4gD893RQQHOzmFW23Au1ShAAMgBlACSpDwDGYrBInB4BGSezBUJhCERjF4RS0OCuV2a6juOB0jzsdiCBBs3QGFgm5lpg1eCGMEQI-WMTMWziWQQMxkBqJBBAh0LIdByeQK2BKZUqItw6IleCxHBxeOYhKaNxJbTJHQpVJpdIC5kZzMsrL51MsBiCAzsfSCdis5mFwOVBDEYCwEG8BHYRDAAHcAEp+gN0ADyIgAogA5AD6ADVIfGAOpEvWtfHkxA2cx2ynOZ3mKwRe2s8x9AiDB1+WnyWkDLaJIEpb2+-2B4NhgCqaAgRXoTBYbCRrCVaR7AaDIdDQ5HZ3VnFxBp111U+vzRsLBj8BGcTICDtdxnk1p8iH6dgIbnkjMsdgMlMsV4SHZwjAgcB0M54MSeb3J0CAALR+PMizrMYQSWI6fLOI4rKQSsD7yM4L4vrMfizPIBiel2aQkBkVC0MBpIFggYymqMtK0valLwayER2jY8jwXMlaCtyRFogUhwNCcZwNJAlEGtRiy9PB9gWARDqHi8N4QW+x6YS+rjyJh2m2B6HaAWKGJkBJe4PP4-RmEWQRwRWd4WsYrJwfeH7RMhxhuieQT6TsxGEHO0w7iBhrmWyZYPosl6eX4cycayDjmMeHEOBMdijJYjj8aKAULmGka9qZoGPK4R5viYT5zDFto1n8D42Oy7KrK43xZd2UZ9ouy6joVIVgeadrctpzrGB5ArKdMFY9JYzz2OYnFNnBzitWkEBELAWAAEYYOJuZUfuTzfMe3lFtNtYEUE8UGJYGGRNYHkce6X5xEAA */
    id: 'eggplant',
    initial: 'ready',
    predictableActionArguments: true,
    context: { // Add this
        errorCode: null,
    },
    states: {
        ready: {
            // Ready
        },
        disabled: {
            // define what should happen when the project is not detected
        },
    }
}, {
});


// Create a service to interpret the machine
export const stateService = interpret(stateMachine);

// Define your API as functions
export const StateMachine = {
    initialize: () => stateService.start(),
    service: () => { return stateService; },
    context: () => { return stateService.getSnapshot().context; },
    state: () => { return stateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EventType) => { stateService.send({ type: eventType }); },
};

export function openView(type: "OPEN_VIEW" | "FILE_EDIT" | "EDIT_DONE", viewLocation: VisualizerLocation) {
    stateService.send({ type: type, viewLocation: viewLocation });
}

async function checkIfEggplantProject() {
    let isEggplant = false;
    try {
        const files = await vscode.workspace.findFiles('**/Ballerina.toml', '**/node_modules/**', 1);
        if (files.length > 0) {
            const data = await fs.promises.readFile(files[0].fsPath, 'utf8');
            isEggplant = data.includes('eggplant');
        }
    } catch (err) {
        console.error(err);
    }
    if (!isEggplant) {
        throw new Error("Eggplant project not found");
    }
    return isEggplant;
}

type ViewFlow = {
    [key in MachineViews]: MachineViews[];
};

const viewFlow: ViewFlow = {
    Overview: [],
    ServiceDesigner: ["Overview"],
    EggplantDiagram: ["Overview"],
};

export function getPreviousView(currentView: MachineViews): MachineViews[] {
    return viewFlow[currentView] || [];
}
