import React from 'react';

// tslint:disable-next-line: no-submodule-imports
import { Story } from '@storybook/react/types-6-0';

import { FormField, PrimitiveBalType } from '../../../../../../ConfigurationSpec/types';
import { Provider as DiagramProvider } from "../../../../../../Contexts/Diagram";
import { CompletionParams, CompletionResponse } from '../../../../../../Definitions';
import { FormElementProps } from '../../types';

import ExpressionEditor from './index';

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
// tslint:disable-next-line: no-submodule-imports

export default {
  title: 'Expression Editor',
  component: ExpressionEditor,
};

const initialVal = '';
const errorDiagnostic = [{
    message: "undefined symbol",
    severity: 1,
    range: {start: {line: 4, character: 25}, end: {line: 4, character: 26}}
}]

const formField: FormField = {
    name: 'ExpressionName',
    displayName: "Expression Name",
    type: PrimitiveBalType.Var,
}

const args: FormElementProps = {
    model: formField,
    customProps: {
        // tslint:disable-next-line:no-empty
        validate: () => {},
        tooltipTitle: "Tooltip Title",
        tooltipActionText: "Tooltip action text",
        tooltipActionLink: "Tooltip action link",
        interactive: true,
    },
    defaultValue: initialVal
};

const contextState = {
    diagnostics:  [],
    targetPosition: {
        endColumn: 22,
        endLine: 10,
        startColumn: 4,
        startLine: 10,
    },
    currentFile: {
        content: "",
    },
    currentApp: {
        workingFile: "/apps/kajendranalagaratnam/ab22/project/choreo.bal",
    },
    langClient: {
        getCompletion: async (_completionParams: CompletionParams): Promise<CompletionResponse[]> => {
            const completions: CompletionResponse[] = [];
            return completions;
        },
        // tslint:disable-next-line:no-empty
        didChange: async (_content): Promise<void> => {},
        diagnostics: async (_content): Promise<any> => {
            return [];
        }
    },
    syntaxTree: {},
}


const Template: Story<FormElementProps> = (formArgs: FormElementProps) =>  (
    <DiagramProvider initialState={contextState} >
        <ExpressionEditor {...formArgs}/>
    </DiagramProvider>
);
export const ExpressionEditorStandard = Template.bind({});
ExpressionEditorStandard.args = args;


const TemplateWithError: Story<FormElementProps> = (formArgs: FormElementProps) =>  (
    <DiagramProvider initialState={{...contextState, diagnostics: errorDiagnostic}} >
        <ExpressionEditor {...formArgs}/>
    </DiagramProvider>
);
export const ExpressionEditorWithError = TemplateWithError.bind({});
ExpressionEditorWithError.args = args;
