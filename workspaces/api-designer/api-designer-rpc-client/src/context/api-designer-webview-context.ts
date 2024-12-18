/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createContext, useContext } from "react";
import { RpcClient } from "../RpcClient";
import { MACHINE_VIEW, VisualizerLocation } from "@wso2-enterprise/api-designer-core";

export interface VisualizerContext {
    viewLocation: VisualizerLocation,
    rpcClient?: RpcClient
    setViewLocation?: (view: VisualizerLocation) => void
}

/**
 * Global visualizer context.
 * This will be used within all the other components
 */
const defaultState: VisualizerContext = {
    viewLocation: { view: MACHINE_VIEW.Overview }
}
export const Context = createContext<VisualizerContext>(defaultState);

export const useVisualizerContext = () => useContext(Context);
