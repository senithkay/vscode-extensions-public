/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { createContext, ReactNode } from 'react';
import { Views } from '../../../resources';

interface DiagramContextProps {
    children?: ReactNode;
    getTypeComposition: (entityID: string) => void;
    currentView: Views;
    createService: (packageName: string, org?: string, version?: string) => Promise<boolean | undefined>;
}

interface IDiagramContext {
    getTypeComposition: (entityID: string) => void;
    currentView: Views;
    createService: (packageName: string, org?: string, version?: string) => Promise<boolean | undefined>;
}

const defaultState: any = {};
export const DiagramContext = createContext<IDiagramContext>(defaultState);

export function DesignDiagramContext(props: DiagramContextProps) {
    const { getTypeComposition, createService, currentView, children } = props;

    return (
        <DiagramContext.Provider value={{ getTypeComposition, createService, currentView }}>
            {children}
        </DiagramContext.Provider>
    );
}
