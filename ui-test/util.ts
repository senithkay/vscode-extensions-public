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

import { expect } from "chai";
import { SideBarView, CustomTreeSection, ActivityBar } from "vscode-extension-tester";

export function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getDiagramExplorer() {
    const activityBar = new ActivityBar();
    // test side bar low code activity
    const lowCodeActivity = await activityBar.getViewControl('Ballerina Low-Code');
    expect(lowCodeActivity).is.not.undefined;
    lowCodeActivity!.openView();
    const sideBar = new SideBarView();
    // test tree views
    expect(await sideBar.getTitlePart().getTitle()).is.equal("BALLERINA LOW-CODE");
    const diagramExplorer = await sideBar.getContent().getSection('Diagram Explorer') as CustomTreeSection;
    const choreoLogin = await sideBar.getContent().getSection('Choreo') as CustomTreeSection;
    expect(diagramExplorer).is.not.undefined;
    expect(choreoLogin).is.not.undefined;
    await wait(5000);
    return diagramExplorer;
}
