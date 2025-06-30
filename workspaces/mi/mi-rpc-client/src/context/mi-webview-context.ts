/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
 */

import { createContext, useContext } from "react";
import { RpcClient } from "../RpcClient";
import { MACHINE_VIEW, VisualizerLocation } from "@wso2-enterprise/mi-core";

export interface VisualizerContext {
    viewLocation: VisualizerLocation,
    rpcClient?: RpcClient
    setViewLocation?: (view: VisualizerLocation) => void
    isLoggedIn: boolean
    setIsLoggedIn?: (isLoggedIn: boolean) => void,
    isLoading?: boolean
    setIsLoading?: (isLoading: boolean) => void
}

/**
 * Global visualizer context.
 * This will be used within all the other components
 */
const defaultState: VisualizerContext = {
    viewLocation: { view: MACHINE_VIEW.Overview },
    isLoggedIn: false,
    isLoading: false
}
export const Context = createContext<VisualizerContext>(defaultState);

export const useVisualizerContext = () => useContext(Context);
