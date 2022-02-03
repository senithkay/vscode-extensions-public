import React, { useEffect, useState } from 'react';

// tslint:disable-next-line:no-submodule-imports
import { Story } from '@storybook/react/types-6-0';
import LowCodeDiagram from '..';
import { ModulePart } from '@wso2-enterprise/syntax-tree';
import { LowCodeDiagramProps } from '../Context/types';
import { getFileContent, getProjectRoot, langClientPromise } from '../../../../stories/story-utils';
import { sizingAndPositioning } from '../Utils';
import { Provider } from '../Context/diagram';

export default {
    title: 'Diagram',
    component: LowCodeDiagram
}

const sampleRelPath = "low-code-editor/src/Diagram/components/LowCodeDiagram/stories/data/sample1.bal";

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

    const visitedST: ModulePart = st && sizingAndPositioning(st) as ModulePart;

    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <LowCodeDiagram syntaxTree={visitedST} isReadOnly={true}/>
        </Provider>
    </>;
}