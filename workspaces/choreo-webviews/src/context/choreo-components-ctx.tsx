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
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { useQuery } from "@tanstack/react-query";
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
    componentLoadError: Error | null
    /** Has the components been fetched for the very first time */
    isComponentsFetched: boolean;
    /** 
     * Count of every local components that's without any local git changes to commit/push & valid path in remote repo. 
     * These components can be pushed to Choreo 
     * */
    pushableComponentCount: number;
    /** Has any components that can be pushed to choreo */
    hasPushableComponents: boolean;
    /** Does the component list include any local components that have not yet been pushed to choreo */
    hasLocalComponents: boolean;
    /** Are there any local components with local changes or un-pushed commits */
    componentsOutOfSync: boolean;
}

const defaultContext: IChoreoComponentsContext = {
    components: [],
    isLoadingComponents: false,
    isRefetchingComponents: false,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    refreshComponents: () => {},
    componentLoadError: null,
    isComponentsFetched: false,
    pushableComponentCount: 0,
    hasPushableComponents: false,
    hasLocalComponents: false,
    componentsOutOfSync: false,
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
    const { isChoreoProject, choreoProject } = useContext(ChoreoWebViewContext);
    const {
        data: components = [],
        isLoading: isLoadingComponents,
        isRefetching: isRefetchingComponents,
        refetch: refreshComponents,
        error: componentLoadError,
        isFetched: isComponentsFetched,
    } = useQuery({
        queryKey: ["project_component_list", choreoProject?.id],
        queryFn: async () => {
            if (!isChoreoProject || !choreoProject) {
                return [];
            }
            return ChoreoWebViewAPI.getInstance().getComponents(choreoProject?.id)
        },
        refetchOnWindowFocus: true,
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        enabled: !!choreoProject?.id,
        keepPreviousData: true
    });

    
    const pushableComponentCount = useMemo(() => {
        const localOnlyComponents = components.filter(
            (component) => component.local
        );
        return localOnlyComponents.reduce((count, component) => {
            if (!component.hasDirtyLocalRepo && !component.hasUnPushedLocalCommits) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [components])

    const hasPushableComponents = useMemo(() => pushableComponentCount > 0, [pushableComponentCount]);
    
    const hasLocalComponents = useMemo(
        () => components?.some((component) => component.local),
        [components]
    );

    const componentsOutOfSync = useMemo(() => {
        return components?.some(
            (component) => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits
        );
    }, [components]);

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().onRefreshComponents(() => {
            refreshComponents();
        });
    }, []);
    
    return (
        <ChoreoComponentsContext.Provider value={{ 
            components,
            componentLoadError,
            isLoadingComponents,
            isRefetchingComponents,
            refreshComponents,
            isComponentsFetched,
            pushableComponentCount,
            hasPushableComponents,
            hasLocalComponents,
            componentsOutOfSync
        }}>
            {children}
        </ChoreoComponentsContext.Provider>
    );
};