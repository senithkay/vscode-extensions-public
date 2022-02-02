import React, { useEffect, useState } from 'react';

// tslint:disable-next-line:no-submodule-imports
import { Story } from '@storybook/react/types-6-0';
import { FunctionDefinition, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { getFileContent, getProjectRoot, langClientPromise } from '../../../../../../../stories/story-utils';
import { sizingAndPositioning } from '../../../../../../utils/diagram-util';
import { Provider } from '../../../../Context/diagram';
import { LowCodeDiagramProps } from '../../../../Context/types';

import { Function, FunctionProps  } from "./../";

export default {
    title: 'Diagram/Component/Function',
    component: Function,
};


const sampleRelPath = "low-code-editor/src/Diagram/components/LowCodeDiagram/Components/RenderingComponents/Function/stories/data/sample1.bal";

const Template: Story<{ f1: string }> = (args: {f1: string }) => {

    const [st, setSt] = useState<ModulePart>(undefined);

    const providerProps: LowCodeDiagramProps = {
        syntaxTree: st,
        isReadOnly: true,
        selectedPosition: {
            startColumn: 0,
            startLine: 0
        },
        api: {
            project: {
                run: () => undefined
            }
        }
    };

    useEffect(() => {

        const filePath = `${getProjectRoot()}/${sampleRelPath}`;

        const uri = `file://${filePath}`;

        async function openFileInLS() {
            const text = await getFileContent(filePath);
            const langClient = await langClientPromise;
            await langClient.didOpen({
                textDocument: {
                  languageId: "ballerina",
                  text,
                  uri,
                  version: 1
                }
            });
            const syntaxTreeResponse = await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri
                }
            });
            setSt(syntaxTreeResponse.syntaxTree);
        }

        async function closeFileInLS() {
            const langClient = await langClientPromise;
            langClient.didClose({
                textDocument: {
                  uri,
                }
            });
        }
        openFileInLS();
        return () => {
            closeFileInLS();
        }
    }, []);

    if (!st) {
        return <></>;
    }

    const functionST: FunctionDefinition = st && STKindChecker.isFunctionDefinition(st.members[0]) && st.members[0];
    const visitedST: FunctionDefinition = (functionST && sizingAndPositioning(functionST)) as FunctionDefinition;

    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <Function model={visitedST} />
        </Provider>
    </>;
}

export const FunctionComponent = Template.bind({});
FunctionComponent.args = {
    f1: ""
};
