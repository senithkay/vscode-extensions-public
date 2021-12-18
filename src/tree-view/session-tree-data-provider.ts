/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
 */
import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { join } from "path";
import { BallerinaExtension, ChoreoSession } from "../core";
import { PALETTE_COMMANDS } from "../project";

export class SessionDataProvider implements TreeDataProvider<TreeItem> {
    private ballerinaExtension: BallerinaExtension;

    constructor(ballerinaExtension: BallerinaExtension) {
        this.ballerinaExtension = ballerinaExtension;
    }

    private _onDidChangeTreeData: EventEmitter<TreeItem | undefined> = new EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
        let treeItems: TreeItem[] = [];
        if (!element) {

            return this.getSessionDetails();
        }
        return treeItems;
    }

    getSessionDetails(): TreeItem[] {
        let treeItems: TreeItem[] = [];
        const choreoSession: ChoreoSession = this.ballerinaExtension.getChoreoSession();
        if (choreoSession.loginStatus) {
            const session = new TreeItem(`Logged in as ${choreoSession.choreoUser}`, TreeItemCollapsibleState.None);
            session.iconPath = {
                light: join(this.ballerinaExtension.extension.extensionPath,
                    'resources', 'images', 'icons', 'user.svg'),
                dark: join(this.ballerinaExtension.extension.extensionPath,
                    'resources', 'images', 'icons', 'user-inverse.svg')
            };
            treeItems.push(session);

            if (this.ballerinaExtension.getCodeServerContext().codeServerEnv) {
                const manage = new TreeItem(`Deploy and Manage in Choreo...`, TreeItemCollapsibleState.None);
                manage.command = {
                    command: 'vscode.open', title: 'Open Choreo Manage Portal',
                    arguments: [Uri.parse(this.ballerinaExtension.getCodeServerContext().manageChoreoRedirectUri!)]
                };
                manage.iconPath = {
                    light: join(this.ballerinaExtension.extension.extensionPath,
                        'resources', 'images', 'icons', 'choreo.svg'),
                    dark: join(this.ballerinaExtension.extension.extensionPath,
                        'resources', 'images', 'icons', 'choreo-inverse.svg')
                };
                treeItems.push(manage);
            }

            if (this.ballerinaExtension.enabledPerformanceForecasting()) {
                const perf = new TreeItem(`Disable performance forecasting...`, TreeItemCollapsibleState.None);
                perf.command = {
                    command: PALETTE_COMMANDS.PERFORMANCE_FORECAST_DISABLE, title: 'Disable Forecasting',
                    arguments: []
                };
                perf.iconPath = {
                    light: join(this.ballerinaExtension.extension.extensionPath,
                        'resources', 'images', 'icons', 'disable.svg'),
                    dark: join(this.ballerinaExtension.extension.extensionPath,
                        'resources', 'images', 'icons', 'disable-inverse.svg')
                };
                treeItems.push(perf);
            } else {
                const perf = new TreeItem(`Enable performance forecasting...`, TreeItemCollapsibleState.None);
                perf.command = {
                    command: PALETTE_COMMANDS.PERFORMANCE_FORECAST_ENABLE, title: 'Enable Forecasting',
                    arguments: []
                };
                perf.iconPath = {
                    light: join(this.ballerinaExtension.extension.extensionPath,
                        'resources', 'images', 'icons', 'enable.svg'),
                    dark: join(this.ballerinaExtension.extension.extensionPath,
                        'resources', 'images', 'icons', 'enable-inverse.svg')
                };
                treeItems.push(perf);
            }

            const signoutItem = new TreeItem("Sign out from Choreo...", TreeItemCollapsibleState.None);
            signoutItem.iconPath = {
                light: join(this.ballerinaExtension.extension.extensionPath,
                    'resources', 'images', 'icons', 'signout.svg'),
                dark: join(this.ballerinaExtension.extension.extensionPath,
                    'resources', 'images', 'icons', 'signout-inverse.svg')
            };
            signoutItem.command = {
                command: 'ballerina.choreo.signout',
                title: "Sign out",
                arguments: []
            };

            // Disable the sign out option for code server users.
            if (process.env.OVERRIDE_CHOREO_AUTHENTICATION !== 'true') {
                treeItems.push(signoutItem);
            }
        }
        return treeItems;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}
