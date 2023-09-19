import { BuildStatus, Component } from "@wso2-enterprise/choreo-core";
export declare function useComponentBuildStatus(component: Component): {
    buildData: BuildStatus;
    isLoadingBuild: boolean;
    isRefetchingBuild: boolean;
    refreshBuild: <TPageData>(options?: import("@tanstack/react-query").RefetchOptions & import("@tanstack/react-query").RefetchQueryFilters<TPageData>) => Promise<import("@tanstack/react-query").QueryObserverResult<BuildStatus, Error>>;
    buildLoadError: Error;
    isFetched: boolean;
};
