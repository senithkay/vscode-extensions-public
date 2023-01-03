/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import React from "react";

import { NodePosition } from "@wso2-enterprise/ballerina-languageclient";

import { ComponentViewInfo } from "../util";

export interface OverviewDiagramProperties {
    addToHistoryStack: (info: ComponentViewInfo) => void;
    navigateBack: () => void;
    navigateToMain: () => void;
    isHistoryStackEmpty: () => boolean;
    currentComponent: ComponentViewInfo;
}

export const Context = React.createContext<OverviewDiagramProperties>({
    navigateBack: undefined,
    addToHistoryStack: undefined,
    navigateToMain: undefined,
    isHistoryStackEmpty: undefined,
    currentComponent: undefined
});

export const OverviewDiagramContextProvider: React.FC<OverviewDiagramProperties> = (props) => {
    const { children, ...restProps } = props;

    return (
        <Context.Provider value={{ ...restProps }}>
            {children}
        </Context.Provider>
    )
}

export const useOverviewDiagramContext = () => React.useContext(Context);
