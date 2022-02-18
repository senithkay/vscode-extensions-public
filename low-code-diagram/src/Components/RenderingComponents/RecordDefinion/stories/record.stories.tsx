/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React, { useEffect, useState } from 'react';

// tslint:disable-next-line: no-submodule-imports
import { Story } from '@storybook/react/types-6-0';
import { ModulePart, STKindChecker, TypeDefinition } from '@wso2-enterprise/syntax-tree';

import { RecordDefinitionComponent } from '..';
import { Provider } from '../../../../Context/diagram';
import { LowCodeDiagramProps } from '../../../../Context/types';
import { getFileContent, getProjectRoot, langClientPromise } from '../../../../stories/story-utils';
import { sizingAndPositioning } from '../../../../Utils';

export default {
    title: 'Diagram/Component/Record',
    component: RecordDefinitionComponent,
};


const sampleRelPath = "low-code-editor/src/Diagram/components/LowCodeDiagram/Components/RenderingComponents/RecordDefinion/stories/data/sample1.bal";

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

    const recordST: TypeDefinition = st && STKindChecker.isTypeDefinition(st.members[0]) && st.members[0];
    const visitedST: TypeDefinition = (recordST && sizingAndPositioning(recordST)) as TypeDefinition;

    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <RecordDefinitionComponent model={visitedST} />
        </Provider>
    </>;
}

export const RecordComponent = Template.bind({});
RecordComponent.args = {
    f1: ""
};
