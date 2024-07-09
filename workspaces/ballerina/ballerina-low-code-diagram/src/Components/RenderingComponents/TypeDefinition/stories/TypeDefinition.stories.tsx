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
import { ModulePart, STKindChecker, TypeDefinition } from '@wso2-enterprise/syntax-tree';

import { TypeDefinitionComponent } from '..';
import { Provider } from '../../../../Context/diagram';
import { LowCodeDiagramProps } from '../../../../Context/types';
import { fetchSyntaxTree, getComponentDataPath, getFileContent, getProjectRoot ,  } from '../../../../stories/story-utils';
import { sizingAndPositioning } from '../../../../Utils';

export default {
    title: 'Diagram/Component/TypeDefinition',
    component: TypeDefinitionComponent,
};

const componentName = "TypeDefinition";
const samplefile1 = "sample1.bal";

const Template: Story<{ f1: string }> = (args: {f1: string }) => {

    const [st, setSt] = useState<ModulePart>(undefined);

    const providerProps: LowCodeDiagramProps = {
        syntaxTree: st,
        fullST: st,
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

    const TypeDefST: TypeDefinition = st && STKindChecker.isTypeDefinition(st.members[0]) && st.members[0];
    const visitedST: TypeDefinition = (TypeDefST && sizingAndPositioning(TypeDefST)) as TypeDefinition;

    return st &&
    // tslint:disable-next-line: jsx-wrap-multiline
    <>
        <Provider {...providerProps}>
            <TypeDefinitionComponent model={visitedST} />
        </Provider>
    </>;
}

export const TypeDefComponent = Template.bind({});
TypeDefComponent.args = {
    f1: ""
};
