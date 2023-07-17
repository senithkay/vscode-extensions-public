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
import React, { useContext, createContext, useMemo, FC, useEffect } from "react";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { Component } from "@wso2-enterprise/choreo-core";

export interface IChoreoComponentsContext {
    /** List of choreo components */
    components: Component[];
    /** Loading components for the first time */
    isLoadingComponents: boolean;
    /** Refetching component list */
    isRefetchingComponents: boolean;
    /** Refresh the component list */
    refreshComponents: () => void;
    /** Errors while loading the components */
    componentLoadError: Error | null;
    /** Has the components been fetched for the very first time */
    isComponentsFetched: boolean;
    /** Components without any local git changes to commit/push. These components can be pushed to Choreo */
    pushableComponents: Component[];
    /** The count of components that can be pushed to choreo */
    pushableComponentCount: number;
    /** Has any components that can be pushed to choreo */
    hasPushableComponents: boolean;
    /** Does the component list include any local components that have not yet been pushed to choreo */
    hasLocalComponents: boolean;
    /** Are there any components that have not been pushed but have local changes */
    hasDirtyLocalComponents: boolean;
    /** Are there any local components with local changes or un-pushed commits */
    componentsOutOfSync: boolean;
    /** Name of the components that are expanded in the panel for a project */
    expandedComponents: string[];
    /** Update the expanded state of a component in the panel */
    toggleExpandedComponents: (componentName: string) => void;
    /** Collapse all the components in the panel */
    collapseAllComponents: () => void;
}

const defaultContext: IChoreoComponentsContext = {
    components: [],
    isLoadingComponents: false,
    isRefetchingComponents: false,
    refreshComponents: () => undefined,
    componentLoadError: null,
    isComponentsFetched: false,
    pushableComponents: [],
    pushableComponentCount: 0,
    hasPushableComponents: false,
    hasLocalComponents: false,
    hasDirtyLocalComponents: false,
    componentsOutOfSync: false,
    expandedComponents: [],
    toggleExpandedComponents: () => undefined,
    collapseAllComponents: () => undefined,
};

const ChoreoComponentsContext = createContext(defaultContext);

export const useChoreoComponentsContext = () => {
    return useContext(ChoreoComponentsContext);
};

/**
 * Context provider to manage choreo components along with derived values.
 * Depends on ChoreoWebViewContext to get the project details
 */
export const ChoreoComponentsContextProvider: FC = ({ children }) => {
    const queryClient = useQueryClient();
    const { isChoreoProject, choreoProject } = useChoreoWebViewContext();
    const projectId = choreoProject?.id;
    const {
        data: components = [],
        isLoading: isLoadingComponents,
        isRefetching: isRefetchingComponents,
        refetch: refreshComponents,
        error: componentLoadError,
        isFetched: isComponentsFetched,
    } = useQuery({
        queryKey: ["project_component_list", projectId],
        queryFn: async () => {
            if (!isChoreoProject || !choreoProject) {
                return [];
            }
            return ChoreoWebViewAPI.getInstance().getComponents(projectId);
        },
        refetchOnWindowFocus: true,
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        enabled: !!projectId,
        onSuccess: () => refreshExpandedComponents(),
    });

    const { data: expandedComponents = [] } = useQuery({
        queryKey: ["project_expanded_components", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getExpandedComponents(projectId),
        enabled: !!projectId,
    });

    const { mutate: toggleExpandedComponents } = useMutation({
        mutationFn: async (componentName: string) => {
            if (choreoProject?.id) {
                let newExpandedComponents: string[] = [];
                if (expandedComponents?.includes(componentName)) {
                    newExpandedComponents = expandedComponents?.filter((item) => item !== componentName);
                } else if (expandedComponents) {
                    newExpandedComponents = [...expandedComponents, componentName];
                }

                queryClient.setQueryData(["project_expanded_components", projectId], newExpandedComponents);
                await ChoreoWebViewAPI.getInstance().setExpandedComponents(choreoProject?.id, newExpandedComponents);
            }
        },
    });

    const { mutate: refreshExpandedComponents } = useMutation({
        mutationFn: async () => {
            if (choreoProject?.id) {
                const newExpandedComponents = expandedComponents.filter((name) =>
                    components.some((component) => component.name === name)
                );
                if (expandedComponents.toString() !== newExpandedComponents.toString()) {
                    queryClient.setQueryData(["project_expanded_components", projectId], newExpandedComponents);
                    await ChoreoWebViewAPI.getInstance().setExpandedComponents(
                        choreoProject?.id,
                        newExpandedComponents
                    );
                }
            }
        },
    });

    const { mutate: collapseAllComponents } = useMutation({
        mutationFn: async () => {
            if (choreoProject?.id) {
                queryClient.setQueryData(["project_expanded_components", projectId], []);
                await ChoreoWebViewAPI.getInstance().setExpandedComponents(choreoProject?.id, []);
            }
        },
    });

    const pushableComponents = useMemo(() => {
        const localOnlyComponents = components.filter((component) => component.local);
        return localOnlyComponents.reduce((comps, component) => {
            if (!component.hasDirtyLocalRepo && !component.hasUnPushedLocalCommits) {
                return [...comps, component];
            }
            return comps;
        }, []);
    }, [components]);

    const pushableComponentCount = pushableComponents.length;

    const hasPushableComponents = useMemo(() => pushableComponentCount > 0, [pushableComponentCount]);

    const hasDirtyLocalComponents = useMemo(
        () =>
            components?.some(
                (component) => component.local && (component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits)
            ),
        [components]
    );

    const hasLocalComponents = useMemo(() => components?.some((component) => component.local), [components]);

    const componentsOutOfSync = useMemo(() => {
        return components?.some((component) => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits);
    }, [components]);

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().onRefreshComponents(() => {
            refreshComponents();
        });
    }, []);

    return (
        <ChoreoComponentsContext.Provider
            value={{
                components,
                componentLoadError,
                isLoadingComponents,
                isRefetchingComponents,
                refreshComponents,
                isComponentsFetched,
                pushableComponents,
                pushableComponentCount,
                hasDirtyLocalComponents,
                hasPushableComponents,
                hasLocalComponents,
                componentsOutOfSync,
                collapseAllComponents,
                expandedComponents,
                toggleExpandedComponents,
            }}
        >
            {children}
        </ChoreoComponentsContext.Provider>
    );
};
