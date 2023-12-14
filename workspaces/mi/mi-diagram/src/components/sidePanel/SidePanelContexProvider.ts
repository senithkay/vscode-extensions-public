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

interface SidePanelontext {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setNodePosition: Dispatch<SetStateAction<Range>>;
    showBackBtn: Dispatch<SetStateAction<boolean>>;
    backBtn: number;
}

const SidePanelContext = React.createContext<SidePanelontext>({
    setIsOpen: () => { },
    setNodePosition: () => { },
    showBackBtn: () => { },
    backBtn: 0,
})
export const SidePanelProvider = SidePanelContext.Provider
export default SidePanelContext
