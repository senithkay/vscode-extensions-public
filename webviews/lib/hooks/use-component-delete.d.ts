import { Component } from "@wso2-enterprise/choreo-core";
export declare function useComponentDelete(component: Component): {
    handleDeleteComponentClick: import("@tanstack/react-query").UseMutateFunction<Component, Error, Component, void>;
    deletingComponent: boolean;
};
