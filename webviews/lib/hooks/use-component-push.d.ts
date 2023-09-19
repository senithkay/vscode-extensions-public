import { Component } from "@wso2-enterprise/choreo-core";
export declare function useComponentPush(component: Component): {
    handlePushComponentClick: import("@tanstack/react-query").UseMutateFunction<void, Error, string, unknown>;
    pushingSingleComponent: boolean;
};
