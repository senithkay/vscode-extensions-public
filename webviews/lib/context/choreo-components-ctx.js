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
import React, { useContext, createContext, useMemo, useEffect } from "react";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
const defaultContext = {
    components: [],
    isLoadingComponents: false,
    isRefetchingComponents: false,
    refreshComponents: () => undefined,
    componentLoadError: null,
    isComponentsFetched: false,
    pushableComponentCount: 0,
    hasPushableComponents: false,
    localComponents: [],
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
export const ChoreoComponentsContextProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const { isChoreoProject, choreoProject } = useChoreoWebViewContext();
    const projectId = choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id;
    const { data: components = [], isLoading: isLoadingComponents, isRefetching: isRefetchingComponents, refetch: refreshComponents, error: componentLoadError, isFetched: isComponentsFetched, } = useQuery({
        queryKey: ["project_component_list", projectId],
        queryFn: () => __awaiter(void 0, void 0, void 0, function* () {
            if (!isChoreoProject || !choreoProject) {
                return [];
            }
            return ChoreoWebViewAPI.getInstance().getComponents({
                projectId: choreoProject.id,
                orgId: parseInt(choreoProject.orgId),
            });
        }),
        refetchOnWindowFocus: true,
        onError: (error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        enabled: !!projectId,
        onSuccess: () => refreshExpandedComponents(),
    });
    const { data: expandedComponents = [] } = useQuery({
        queryKey: ["project_expanded_components", projectId],
        queryFn: () => ChoreoWebViewAPI.getInstance().getExpandedComponents(projectId),
        enabled: !!projectId,
    });
    const { mutate: toggleExpandedComponents } = useMutation({
        mutationFn: (componentName) => __awaiter(void 0, void 0, void 0, function* () {
            if (choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id) {
                let newExpandedComponents = [];
                if (expandedComponents === null || expandedComponents === void 0 ? void 0 : expandedComponents.includes(componentName)) {
                    newExpandedComponents = expandedComponents === null || expandedComponents === void 0 ? void 0 : expandedComponents.filter((item) => item !== componentName);
                }
                else if (expandedComponents) {
                    newExpandedComponents = [...expandedComponents, componentName];
                }
                queryClient.setQueryData(["project_expanded_components", projectId], newExpandedComponents);
                yield ChoreoWebViewAPI.getInstance().setExpandedComponents(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id, newExpandedComponents);
            }
        }),
    });
    const { mutate: refreshExpandedComponents } = useMutation({
        mutationFn: () => __awaiter(void 0, void 0, void 0, function* () {
            if (choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id) {
                const newExpandedComponents = expandedComponents.filter((name) => components.some((component) => component.name === name));
                if (expandedComponents.toString() !== newExpandedComponents.toString()) {
                    queryClient.setQueryData(["project_expanded_components", projectId], newExpandedComponents);
                    yield ChoreoWebViewAPI.getInstance().setExpandedComponents(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id, newExpandedComponents);
                }
            }
        }),
    });
    const { mutate: collapseAllComponents } = useMutation({
        mutationFn: () => __awaiter(void 0, void 0, void 0, function* () {
            if (choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id) {
                queryClient.setQueryData(["project_expanded_components", projectId], []);
                yield ChoreoWebViewAPI.getInstance().setExpandedComponents(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id, []);
            }
        }),
    });
    const pushableComponentCount = useMemo(() => {
        const localOnlyComponents = components.filter((component) => component.local);
        return localOnlyComponents.reduce((count, component) => {
            if (!component.hasDirtyLocalRepo && !component.hasUnPushedLocalCommits) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [components]);
    const hasPushableComponents = useMemo(() => pushableComponentCount > 0, [pushableComponentCount]);
    const hasDirtyLocalComponents = useMemo(() => components === null || components === void 0 ? void 0 : components.some((component) => component.local && (component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits)), [components]);
    const localComponents = useMemo(() => components === null || components === void 0 ? void 0 : components.filter((component) => component.local), [components]);
    const hasLocalComponents = useMemo(() => localComponents.length > 0, [localComponents]);
    const componentsOutOfSync = useMemo(() => {
        return components === null || components === void 0 ? void 0 : components.some((component) => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits);
    }, [components]);
    useEffect(() => {
        ChoreoWebViewAPI.getInstance().onRefreshComponents(() => {
            refreshComponents();
        });
    }, []);
    return (React.createElement(ChoreoComponentsContext.Provider, { value: {
            components,
            componentLoadError,
            isLoadingComponents,
            isRefetchingComponents,
            refreshComponents,
            isComponentsFetched,
            pushableComponentCount,
            hasDirtyLocalComponents,
            hasPushableComponents,
            localComponents,
            hasLocalComponents,
            componentsOutOfSync,
            collapseAllComponents,
            expandedComponents,
            toggleExpandedComponents,
        } }, children));
};
//# sourceMappingURL=choreo-components-ctx.js.map