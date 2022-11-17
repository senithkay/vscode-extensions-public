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

// tslint:disable-next-line:no-submodule-imports
import { Story } from '@storybook/react/types-6-0';
import { FunctionDefinition, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { Function } from '../Components/RenderingComponents/Function';
import { ReadOnlyDiagram } from '../ReadOnlyDiagram/readOnlyDiagram';

import { fetchSyntaxTree, getSourceRoot } from './story-utils';

export default {
    title: 'Diagram/ReadOnlyDiagram',
    component: Function,
};

const fileName: string = "sample1.bal";

const Template: Story<{ f1: string }> = (args: { f1: string }) => {

    const [st, setSt] = useState<ModulePart>(undefined);

    useEffect(() => {
        const filePath = `${getSourceRoot() + "stories/data/" + fileName}`;
        async function setSyntaxTree() {
            const syntaxTree = await fetchSyntaxTree(filePath);
            setSt(syntaxTree);
        }
        setSyntaxTree();
    }, []);

    if (!st) {
        return <></>;
    }

    const functionST: FunctionDefinition = st && STKindChecker.isFunctionDefinition(st.members[0]) && st.members[0];

    return st &&
        // tslint:disable-next-line: jsx-wrap-multiline
        <>
            <ReadOnlyDiagram model={functionST} />
        </>;
}

export const ReadOnlyDiagramComponent = Template.bind({});
ReadOnlyDiagramComponent.args = {
    f1: ""
};
