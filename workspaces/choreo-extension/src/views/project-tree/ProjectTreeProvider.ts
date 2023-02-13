/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { EventEmitter, ProviderResult, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri, window } from "vscode";
import { ext } from "../../extensionVariables";
import { ChoreoSignInPendingTreeItem } from "../common/ChoreoSignInTreeItem";
import { ChoreoProjectTreeItem } from "./ProjectTreeItem";
import { ProjectRegistry } from "../../registry/project-registry";
import { getLogger } from "../../logger/logger";

export type ProjectTreeItem = ChoreoProjectTreeItem | ChoreoSignInPendingTreeItem;

export class ProjectsTreeProvider implements TreeDataProvider<ProjectTreeItem> {

    private _onDidChangeTreeData = new EventEmitter<ProjectTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {
        ext.context.subscriptions.push(ext.api.onStatusChanged(() => {
            this.refresh();
        }));
        ext.context.subscriptions.push(ext.api.onOrganizationChanged(() => {
            this.refresh();
        }));
    }

    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return new Promise(async (resolve, reject) => {
            const isChoreoProject = await ext.api.isChoreoProject();
            if (isChoreoProject) {
                const project = await ext.api.getChoreoProject();
                if (element instanceof ChoreoProjectTreeItem && project && project.id === element.project.id) {
                    element.description = element.description + " (opened)";
                }
            }
            resolve(element);
        });
    }

    getChildren(element?: TreeItem): ProviderResult<ProjectTreeItem[]> {
        if (ext.api.status === "LoggedIn") {
            if (!element) {
                return this.loadProjects();
            }
        } else if (ext.api.status === "LoggingIn") {
            return [new ChoreoSignInPendingTreeItem()];
        }
    }

    refresh(item?: ProjectTreeItem): void {
        this._onDidChangeTreeData.fire(item);
    }

    private async loadProjects(): Promise<ChoreoProjectTreeItem[]> {
        const selectedOrg = ext.api.selectedOrg;
        getLogger().debug("Loading projects for organization: " + selectedOrg?.name);
        if (selectedOrg) {
            try {
               const projects = await ProjectRegistry.getInstance().refreshProjects() || [];
               return projects.map((proj) => new ChoreoProjectTreeItem(proj));
            } catch (error) {
                getLogger().error("Error loading projects for organization: " + selectedOrg?.name, error);
                window.showErrorMessage("Error loading projects for organization: " + selectedOrg?.name);
            }
        } else {
            getLogger().debug("No organization selected");
        }
        return [];
    }
}
