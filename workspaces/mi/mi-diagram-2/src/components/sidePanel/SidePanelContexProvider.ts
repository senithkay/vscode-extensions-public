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
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    isOpen: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    isEditing: boolean;
    setNodeRange: Dispatch<SetStateAction<Range>>;
    nodeRange?: Range;
    setOperationName?: Dispatch<SetStateAction<string>>;
    operationName?: string;
    setFormValues?: Dispatch<SetStateAction<{ [key: string]: any }>>;
    formValues?: { [key: string]: any };
    setShowBackBtn: Dispatch<SetStateAction<boolean>>;
    showBackBtn: boolean;
    setBackBtn: Dispatch<SetStateAction<number>>;
    backBtn: number;
}

const SidePanelContext = React.createContext<SidePanelContext>({
    setIsOpen: () => { },
    isOpen: false,
    setIsEditing: () => { },
    isEditing: false,
    setNodeRange: () => { },
    nodeRange: undefined,
    setOperationName: () => { },
    operationName: undefined,
    setFormValues: () => { },
    formValues: {},
    setShowBackBtn: () => { },
    showBackBtn: false,
    setBackBtn: () => { },
    backBtn: undefined,
})
export const SidePanelProvider = SidePanelContext.Provider
export default SidePanelContext
