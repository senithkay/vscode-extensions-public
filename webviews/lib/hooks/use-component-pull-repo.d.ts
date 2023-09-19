import { Component, Repository } from "@wso2-enterprise/choreo-core";
export declare function useComponentPullRepo(component: Component): {
    pullComponent: import("@tanstack/react-query").UseMutateFunction<void, unknown, {
        repository: Repository;
        branchName: string;
        componentId: string;
    }, void>;
    isPulling: boolean;
};
