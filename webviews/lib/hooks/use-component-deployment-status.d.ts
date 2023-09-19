import { Component, Deployment } from "@wso2-enterprise/choreo-core";
export declare function useComponentDeploymentStatus(component: Component): {
    devDeploymentData: Deployment;
    isLoadingDeployment: boolean;
    isRefetchingDeployment: boolean;
    refreshDeployment: <TPageData>(options?: import("@tanstack/react-query").RefetchOptions & import("@tanstack/react-query").RefetchQueryFilters<TPageData>) => Promise<import("@tanstack/react-query").QueryObserverResult<Deployment, Error>>;
    deploymentLoadError: Error;
    isFetched: boolean;
};
