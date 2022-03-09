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
import { ModulePart, ModuleVarDecl, STKindChecker } from '@wso2-enterprise/syntax-tree';

import { ModuleVariable } from '..';
import { Provider } from '../../../../Context/diagram';
import { LowCodeDiagramProps } from '../../../../Context/types';
import { fetchSyntaxTree, getComponentDataPath, getFileContent, getProjectRoot, langClientPromise } from '../../../../stories/story-utils';
import { sizingAndPositioning } from '../../../../Utils';

export default {
    title: 'Diagram/Component/ModuleVariable',
    component: ModuleVariable,
};

const componentName = "ModuleVariable";
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
            const syntaxTree = await fetchSyntaxTree(filePath);
            setSt(syntaxTree);
        }
        setSyntaxTree();
    }, []);

    if (!st) {
        return <></>;
    }

    const ModuleVarST: ModuleVarDecl = st && STKindChecker.isModuleVarDecl(st.members[0]) && st.members[0];
    const visitedST: ModuleVarDecl = (ModuleVarST && sizingAndPositioning(ModuleVarST)) as ModuleVarDecl;

    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <ModuleVariable model={visitedST} />
        </Provider>
    </>;
}

export const ModuleVarComponent = Template.bind({});
ModuleVarComponent.args = {
    f1: ""
};
