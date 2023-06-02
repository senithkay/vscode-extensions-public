/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
*
* This software is the property of WSO2 LLC. and its suppliers, if any.
* Dissemination of any information or reproduction of any material contained
* herein is strictly forbidden, unless permitted by WSO2 in accordance with
* the WSO2 Commercial License available at http://wso2.com/licenses.
* For specific language governing the permissions and limitations under
* this license, please see the license as well as any agreement you’ve
* entered into with WSO2 governing the purchase of this software and any
* associated services.
*/
import React, { FC } from 'react';

import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from '../Context/diagram';
import { LowCodeDiagramContext } from "../Context/types";

import {getDiagramActions, getDiagramAPIProps, getDiagramProperties, getDiagramState} from "./utils/test-utils";

interface TestProviderProps {
    completeST: STNode;
    focusedST: STNode;
}

export const TestProvider: FC<TestProviderProps> = (props) => {
    const { children, completeST, focusedST } = props;
    const contextValue: LowCodeDiagramContext = {
        actions: getDiagramActions(),
        api: getDiagramAPIProps(),
        props: getDiagramProperties(completeST, focusedST),
        state: getDiagramState()
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}
