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
import React from "react";
import { Component, PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, Repository } from "@wso2-enterprise/choreo-core";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styled from "@emotion/styled";

const GridVSCodeLink = styled(VSCodeLink) <{ disabled: boolean }>`
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    color:  ${props => props.disabled ? 'var(--foreground)' : 'var(--link-foreground)'};
    text-decoration: underline;
    &:hover {
        text-decoration: ${props => props.disabled ? 'none' : 'underline'};
    }
`

export const ComponentDetailActions: React.FC<{
    component: Component;
    refetchComponents: () => void;
    handleSourceControlClick: () => void;
    reachedChoreoLimit: boolean;
    loading?: boolean;
}> = (props) => {
    const { component, refetchComponents, reachedChoreoLimit, loading, handleSourceControlClick } = props;
    const hasDirtyLocalRepo = component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits;

    const queryClient = useQueryClient();

    const { mutate: handlePushComponentClick, isLoading: pushingSingleComponent } = useMutation({
        mutationFn: (componentName: string) => ChoreoWebViewAPI.getInstance().pushLocalComponentToChoreo({ projectId: component.projectId, componentName }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onSuccess: async (_, name) => {
            await queryClient.cancelQueries({ queryKey: ["overview_component_list", component.projectId] })
            const previousComponents: Component[] | undefined = queryClient.getQueryData(["overview_component_list", component.projectId])
            const updatedComponents = previousComponents?.map(item => item.name === name ? ({ ...item, local: false }) : item);
            queryClient.setQueryData(["overview_component_list", component.projectId], updatedComponents)
            refetchComponents()
        },
    });

    const { mutate: pullComponent, isLoading: isPulling } = useMutation({
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
                properties: { component: component?.name },
            })
        },
        mutationFn: async ({ repository, branchName, componentId }: { repository: Repository; branchName: string; componentId: string }) => {
            if (component.projectId && repository && branchName) {
                const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(component.projectId);
                if (projectPath) {
                    const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                        repository: `${repository.organizationApp}/${repository.nameApp}`,
                        workspaceFilePath: projectPath,
                        branch: branchName,
                        gitProvider: repository.gitProvider
                    })
                    if (isCloned) {
                        await ChoreoWebViewAPI.getInstance().pullComponent({ componentId, projectId: component.projectId })
                    } else {
                        await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                            repository: `${repository.organizationApp}/${repository.nameApp}`,
                            workspaceFilePath: projectPath,
                            branch: branchName,
                            gitProvider: repository.gitProvider
                        });
                    }
                } else {
                    await ChoreoWebViewAPI.getInstance().cloneChoreoProject(component.projectId);
                }
            }
        },
        onSuccess: () => refetchComponents(),
    });

    let visibleAction: 'push' | 'pull' | 'sync' | undefined;
    if (hasDirtyLocalRepo) {
        visibleAction = 'sync';
    } else if (component.isRemoteOnly && component.repository) {
        visibleAction = 'pull'
    } else if (component.local) {
        visibleAction = 'push'
    }

    return (
        <>
            {visibleAction === 'sync' && (
                <GridVSCodeLink
                    onClick={handleSourceControlClick}
                    title="Open source control view & sync changes"
                >
                    Commit & Push
                </GridVSCodeLink>
            )}
            {visibleAction === 'pull' && (
                <GridVSCodeLink
                    onClick={() => {
                        if (component?.repository?.branchApp && !loading && !isPulling) {
                            pullComponent({
                                repository: component.repository,
                                branchName: component?.repository?.branchApp,
                                componentId: component.id
                            });
                        }
                    }}
                    title="Pull code from remote repository"
                    disabled={loading || isPulling}
                >
                    {isPulling ? "Pulling..." : "Pull Component"}
                </GridVSCodeLink>
            )}
            {visibleAction === 'push' && (
                <GridVSCodeLink
                    onClick={() => {
                        if (!loading && !pushingSingleComponent && !reachedChoreoLimit) {
                            handlePushComponentClick(component.name)
                        }
                    }}
                    title={reachedChoreoLimit ? "Please upgrade your tier to push to Choreo" : "Push component to Choreo"}
                    disabled={loading || pushingSingleComponent || reachedChoreoLimit}
                >
                    {pushingSingleComponent ? "Pushing..." : "Push to Choreo"}
                </GridVSCodeLink>
            )}
            {visibleAction === undefined && '-'}
        </>
    );
};

