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
import React from 'react';

import { Story } from '@storybook/react';
import { STNode } from '@wso2-enterprise/syntax-tree';

import { LowCodeEditorProps, STSymbolInfo } from '../../../../../..';
import { Provider as DiagramProvider } from '../../../../../../Contexts/Diagram';

import { Service } from '.';
import listenerDecl from './data/listener-st-raw.json';
import serviceDecl from "./data/service-raw.json";

export default {
    title: 'Low Code Editor/Testing/Diagram/Service Definition',
    component: Service,
};

const symbolInfo: STSymbolInfo = {
    moduleEndpoints: new Map<string, STNode>(),
    localEndpoints: new Map<string, STNode>(),
    actions: new Map<string, STNode>(),
    variables: new Map<string, STNode[]>(),
    configurables: new Map<string, STNode>(),
    callStatement: new Map<string, STNode[]>(),
    variableNameReferences: new Map<string, STNode[]>(),
    assignmentStatement: new Map<string, STNode[]>(),
    recordTypeDescriptions: new Map<string, STNode>(),
    listeners: new Map<string, STNode>(),
    moduleVariables: new Map<string, STNode>()
};

symbolInfo.listeners.set("defaultListener", listenerDecl)



const Template: Story<LowCodeEditorProps> = (args: LowCodeEditorProps) =>
(
    <DiagramProvider {...args} >
        <Service model={(args as any).model} />
    </DiagramProvider>
);

export const ServiceDeclaration = Template.bind({});
ServiceDeclaration.args = {
    model: serviceDecl,
    stSymbolInfo: symbolInfo,
};
