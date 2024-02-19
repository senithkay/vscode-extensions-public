/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { Dispatch, SetStateAction } from "react";
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';

interface SidePanelContext {
    isOpen: boolean;
    isEditing: boolean;
    nodeRange?: Range;
    operationName?: string;
    formValues?: { [key: string]: any };
    title?: string;
    setSidePanelState?: Dispatch<SetStateAction<any>>;
}

const SidePanelContext = React.createContext<SidePanelContext>({
    isOpen: false,
    isEditing: false,
    nodeRange: undefined,
    operationName: undefined,
    formValues: {},
    title: undefined,
    setSidePanelState: () => {},
})

export const SidePanelProvider = SidePanelContext.Provider
export default SidePanelContext
