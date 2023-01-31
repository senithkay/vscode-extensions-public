/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import React, { useState } from "react";

import { ComponentViewInfo } from "../../OverviewDiagram/util";


export function useComponentHistory():
    [ComponentViewInfo[], (info: ComponentViewInfo) => void, () => void, () => void] {
    const [history, updateHistory] = useState<ComponentViewInfo[]>([]);

    const historyPush = (componentViewInfo: ComponentViewInfo) => {
        updateHistory([...history, componentViewInfo]);
    }

    const historyPop = () => {
        if (history.length === 0) return;
        updateHistory(history.slice(0, history.length - 1));
    }

    const historyClear = () => {
        updateHistory([]);
    }

    return [history, historyPush, historyPop, historyClear];
}

