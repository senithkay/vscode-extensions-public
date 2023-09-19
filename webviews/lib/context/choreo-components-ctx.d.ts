import { FC } from "react";
import { Component } from "@wso2-enterprise/choreo-core";
export interface IChoreoComponentsContext {
    /** List of choreo components */
    components: Component[];
    /** List of choreo components that have not been pushed to Choreo yet */
    localComponents: Component[];
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
export declare const useChoreoComponentsContext: () => IChoreoComponentsContext;
/**
 * Context provider to manage choreo components along with derived values.
 * Depends on ChoreoWebViewContext to get the project details
 */
export declare const ChoreoComponentsContextProvider: FC;
