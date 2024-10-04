/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';

// tslint:disable-next-line: no-submodule-imports
import { Story } from '@storybook/react/types-6-0';
import { ActionStatement, FunctionDefinition, LocalVarDecl, ModulePart, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { ActionInvocation } from "..";
import { Provider } from '../../../../Context/diagram';
import { LowCodeDiagramProps } from '../../../../Context/types';
import { fetchSyntaxTree, getComponentDataPath, getFileContent  } from '../../../../stories/story-utils';
import { sizingAndPositioning } from '../../../../Utils';
import { Function } from '../../Function';


export default {
    title: 'Diagram/Component/ActionInvocation',
    component: Function,
};

const componentName = "ActionInvocation";
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
    const connectorST = functionST && STKindChecker.isFunctionBodyBlock(functionST.functionBody)
                         && STKindChecker.isLocalVarDecl(functionST.functionBody.statements[0])
                         && functionST.functionBody.statements[0];
    const visitedConnectorST: LocalVarDecl = (connectorST && sizingAndPositioning(connectorST)) as LocalVarDecl;

    const actionST = functionST && STKindChecker.isFunctionBodyBlock(functionST.functionBody)
                         && STKindChecker.isLocalVarDecl(functionST.functionBody.statements[1])
                         && functionST.functionBody.statements[1];
    const visitedActionST: LocalVarDecl = (actionST && sizingAndPositioning(actionST)) as LocalVarDecl;

    const visitedST: FunctionDefinition = (functionST && sizingAndPositioning(functionST)) as FunctionDefinition;

    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <ActionInvocation model={visitedConnectorST} />
            <ActionInvocation model={visitedActionST} />
            <Function model={visitedST} />
        </Provider>
    </>;
}

export const ActionInvocationComponent = Template.bind({});
ActionInvocationComponent.args = {
    f1: ""
};
