/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import { By, WebView } from "vscode-extension-tester";

let webview: WebView;
let currentElement: any;

export class Service {
    constructor(element) {
        webview = element;
    }

    async getHeader() {
        currentElement = await webview.findWebElement(By.className("service-header"));
        return this;
    }

    async getServiceOptions() {
        currentElement = (await currentElement.findElements(By.className("amendment-option")))[0];
        return this;
    }

    async getRun() {
        currentElement = await webview.findWebElement(By.id("run-button"));
        return this;
    }

    async getTryIt() {
        currentElement = await webview.findWebElement(By.id("try-button"));
        return this;
    }

    async click() {
        currentElement.click();
        return this;
    }
}
