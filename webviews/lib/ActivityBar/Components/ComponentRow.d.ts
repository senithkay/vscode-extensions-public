import { Component } from "@wso2-enterprise/choreo-core";
export declare const ComponentRow: (props: {
    component: Component;
    expanded: boolean;
    handleExpandClick: (componentName: string) => void;
    loading?: boolean;
}) => JSX.Element;
