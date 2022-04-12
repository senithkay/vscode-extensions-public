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

import React from "react";
import { render } from "react-dom";
import { UPDATE_EVENT, VariableValue, VariableView } from "./variable-view/VariableView";

let container: HTMLElement;

export function renderVariableView(target: HTMLElement, getVariableValues: () => Promise<VariableValue[]>) {
    container = target;
    render(<VariableView getVariableValues={getVariableValues} container={target} />, target);
}

export function updateVariableValues() {
    if (container) {
        container.dispatchEvent(new Event(UPDATE_EVENT));
    }
}
