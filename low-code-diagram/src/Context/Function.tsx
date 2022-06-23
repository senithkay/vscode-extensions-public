/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { FunctionProperties } from "./types";

const defaultState: FunctionProperties = {
    overlayId: '',
    overlayNode: undefined,
    functionNode: undefined,
    hasWorker: false
}

export const Context = React.createContext<FunctionProperties>(defaultState);

export const Provider: React.FC<FunctionProperties> = (props) => {
    const { children, ...restProps } = props;
    return (
        <Context.Provider value={{ ...restProps }} >
            {props.children}
        </Context.Provider>
    )
}

export const useFunctionContext = () => React.useContext(Context);
