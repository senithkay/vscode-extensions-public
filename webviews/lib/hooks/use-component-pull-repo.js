var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT } from "@wso2-enterprise/choreo-core";
import { useChoreoComponentsContext } from "../context/choreo-components-ctx";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
export function useComponentPullRepo(component) {
    const { refreshComponents } = useChoreoComponentsContext();
    const { choreoProject } = useChoreoWebViewContext();
    const { mutate: pullComponent, isLoading: isPulling } = useMutation({
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
                properties: { component: component === null || component === void 0 ? void 0 : component.name },
            });
        },
        mutationFn: ({ repository, branchName, componentId, }) => __awaiter(this, void 0, void 0, function* () {
            if (component.projectId && repository && branchName) {
                const projectPath = yield ChoreoWebViewAPI.getInstance().getProjectLocation(component.projectId);
                if (projectPath) {
                    const isCloned = yield ChoreoWebViewAPI.getInstance()
                        .getChoreoProjectManager()
                        .isRepoCloned({
                        repository: `${repository.organizationApp}/${repository.nameApp}`,
                        workspaceFilePath: projectPath,
                        branch: branchName,
                        gitProvider: repository.gitProvider,
                    });
                    if (isCloned) {
                        yield ChoreoWebViewAPI.getInstance().pullComponent({
                            componentId,
                            projectId: component.projectId,
                        });
                    }
                    else {
                        yield ChoreoWebViewAPI.getInstance()
                            .getChoreoProjectManager()
                            .cloneRepo({
                            repository: `${repository.organizationApp}/${repository.nameApp}`,
                            workspaceFilePath: projectPath,
                            branch: branchName,
                            gitProvider: repository.gitProvider,
                        });
                        const isSubpathUnavailable = yield ChoreoWebViewAPI.getInstance().isSubpathAvailable({
                            orgName: repository.organizationApp,
                            projectID: component.projectId,
                            repoName: repository.nameApp,
                            subpath: repository.appSubPath,
                        });
                        if (isSubpathUnavailable) {
                            ChoreoWebViewAPI.getInstance().showErrorMsg(`Unable to find ${repository.appSubPath} within the cloned repository`);
                        }
                    }
                }
                else {
                    yield ChoreoWebViewAPI.getInstance().cloneChoreoProject({
                        orgId: parseInt(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.orgId),
                        projectId: component.projectId,
                    });
                }
            }
        }),
        onSuccess: () => refreshComponents(),
    });
    return { pullComponent, isPulling };
}
//# sourceMappingURL=use-component-pull-repo.js.map