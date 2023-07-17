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
import { useMutation } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { Component, PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, Repository } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";

export function useComponentPullRepo(component: Component) {
    const { refreshComponents } = useChoreoComponentsContext();
    const { mutate: pullComponent, isLoading: isPulling } = useMutation({
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
                properties: { component: component?.name },
            });
        },
        mutationFn: async ({
            repository,
            branchName,
            componentId,
        }: {
            repository: Repository;
            branchName: string;
            componentId: string;
        }) => {
            if (component.projectId && repository && branchName) {
                const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(component.projectId);
                if (projectPath) {
                    const isCloned = await ChoreoWebViewAPI.getInstance()
                        .getChoreoProjectManager()
                        .isRepoCloned({
                            repository: `${repository.organizationApp}/${repository.nameApp}`,
                            workspaceFilePath: projectPath,
                            branch: branchName,
                            gitProvider: repository.gitProvider,
                        });
                    if (isCloned) {
                        await ChoreoWebViewAPI.getInstance().pullComponent({
                            componentId,
                            projectId: component.projectId,
                        });
                    } else {
                        await ChoreoWebViewAPI.getInstance()
                            .getChoreoProjectManager()
                            .cloneRepo({
                                repository: `${repository.organizationApp}/${repository.nameApp}`,
                                workspaceFilePath: projectPath,
                                branch: branchName,
                                gitProvider: repository.gitProvider,
                            });
                        const isSubpathUnavailable = await ChoreoWebViewAPI.getInstance().isSubpathAvailable({
                            orgName: repository.organizationApp,
                            projectID: component.projectId,
                            repoName: repository.nameApp,
                            subpath: repository.appSubPath,
                        });

                        if (isSubpathUnavailable) {
                            ChoreoWebViewAPI.getInstance().showErrorMsg(
                                `Unable to find ${repository.appSubPath} within the cloned repository`
                            );
                        }
                    }
                } else {
                    await ChoreoWebViewAPI.getInstance().cloneChoreoProject(component.projectId);
                }
            }
        },
        onSuccess: () => refreshComponents(),
    });

    return { pullComponent, isPulling };
}
