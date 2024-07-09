/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';

// tslint:disable-next-line:no-submodule-imports
import { Story } from '@storybook/react/types-6-0';
import { ForeachStatement, FunctionDefinition,  ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { ForEach } from "..";
import { Provider } from '../../../../Context/diagram';
import { LowCodeDiagramProps } from '../../../../Context/types';
import { fetchSyntaxTree, getComponentDataPath } from '../../../../stories/story-utils';
import { sizingAndPositioning } from '../../../../Utils';
import { Function } from '../../Function';


export default {
    title: 'Diagram/Component/ForEach',
    component: ForEach,
};

const componentName = "ForEach";
const samplefile1 = "sample1.bal";

const Template: Story<{ f1: string }> = (args: {f1: string }) => {

    const [st, setSt] = useState<ModulePart>(undefined);

    const providerProps: LowCodeDiagramProps = {
        syntaxTree: st,
        isReadOnly: true,
        selectedPosition: {
            startColumn: 0,
            startLine: 0
        }
    };

    useEffect(() => {

        const filePath = `${getComponentDataPath(componentName, samplefile1)}`;

        async function setSyntaxTree() {
            const syntaxTree = await fetchSyntaxTree(filePath) as ModulePart;
            setSt(syntaxTree);
        }
        setSyntaxTree();
    }, []);

    if (!st) {
        return <></>;
    }

    const functionST: FunctionDefinition = st && STKindChecker.isFunctionDefinition(st.members[0]) && st.members[0];
    const foreschST = functionST && STKindChecker.isFunctionBodyBlock(functionST.functionBody)
                         && STKindChecker.isForeachStatement(functionST.functionBody.statements[0])
                         && functionST.functionBody.statements[0];
    const visitedForeachST: ForeachStatement = (foreschST && sizingAndPositioning(foreschST)) as ForeachStatement;

    const visitedST: FunctionDefinition = (functionST && sizingAndPositioning(functionST)) as FunctionDefinition;
    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <ForEach model={visitedForeachST} />
            <Function model={visitedST} />
        </Provider>
    </>;
}

export const ForEachComponent = Template.bind({});
ForEachComponent.args = {
    f1: ""
};
