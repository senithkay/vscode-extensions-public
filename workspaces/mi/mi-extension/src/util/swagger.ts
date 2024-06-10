/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { cloneDeep } from "lodash";

export interface Swagger {
    openapi: string;
    info: {
        title: string;
        description: string;
        version: string;
    };
    servers: {
        url: string;
    }[];
    paths: Record<string, any>;
}

interface SwaggerUtilProps {
    existingSwagger: Swagger;
    generatedSwagger: Swagger;
}

interface Resource {
    path: string;
    methods: string[];
}

interface ResourceInfoResponse {
    added: Resource[];
    removed: Resource[];
    updated: Resource[];
}

/**
 * Compares two objects and returns true if they are equal.
 * @param obj1 - Object 1
 * @param obj2 - Object 2
 * @param levels - Number of levels to compare
 * @returns - Equal or not upto the specified levels
 */
const recursiveComparison = (obj1: Record<string, any>, obj2: Record<string, any>, levels?: number): boolean => {
    if (levels && levels === 0) {
        return true;
    };

    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
    }

    let isEqual = true;
    for (const field in obj1) {
        if (typeof obj2[field] === "undefined") {
            isEqual = false;
            break;
        }

        if (typeof obj1[field] === "object") {
            if (levels) {
                isEqual = recursiveComparison(obj1[field], obj2[field], levels - 1);
            } else {
                isEqual = recursiveComparison(obj1[field], obj2[field]);
            }

            if (!isEqual) {
                break;
            }
        } else {
            if (obj1[field] !== obj2[field]) {
                isEqual = false;
                break;
            }
        }
    }

    return isEqual;
};

export const isEqualSwaggers = (props: SwaggerUtilProps): boolean => {
    const { existingSwagger, generatedSwagger } = props;

    let isEqual = true;
    for (const field in existingSwagger) {
        if (field === "paths") {
            isEqual = recursiveComparison(existingSwagger[field], generatedSwagger[field], 2);
        } else {
            isEqual = recursiveComparison(existingSwagger[field], generatedSwagger[field]);
        }
    }

    return isEqual;
};

/**
 * Merges swagger resources and methods.
 * @param oldObj - Existing resources object
 * @param newObj - Generated resources object
 * @returns - Merged resources object
 */
const mergePaths = (oldObj: Record<string, any>, newObj: Record<string, any>): Record<string, any> => {
    const result = cloneDeep(newObj);

    for (const resource in newObj) {
        // If resource already exists
        if (oldObj[resource]) {
            for (const method in newObj[resource]) {
                // If method already exists
                if (oldObj[resource][method]) {
                    result[resource][method] = oldObj[resource][method];
                }
            }
        }
    }

    return result;
};

export const mergeSwaggers = (props: SwaggerUtilProps): Swagger => {
    const { existingSwagger, generatedSwagger } = props;

    return {
        ...generatedSwagger,
        paths: mergePaths(existingSwagger.paths, generatedSwagger.paths)
    };
};

export const getResourceInfo = (props: SwaggerUtilProps): ResourceInfoResponse => {
    const { existingSwagger, generatedSwagger } = props;
    const added: Resource[] = [];
    const removed: Resource[] = [];
    const updated: Resource[] = [];

    // Find newly added resources
    for (const resource in existingSwagger.paths) {
        if (!generatedSwagger.paths[resource]) {
            added.push({
                path: resource,
                methods: Object
                    .keys(existingSwagger.paths[resource])
                    .map(method => method.toUpperCase())
            });
        } else {
            for (const method in existingSwagger.paths[resource]) {
                if (generatedSwagger.paths[resource][method]) {
                    updated.push({
                        path: resource,
                        methods: Object
                            .keys(existingSwagger.paths[resource])
                            .map(method => method.toUpperCase())
                    });
                }
            }
        }
    }

    // Find removed resources
    for (const resource in generatedSwagger.paths) {
        if (!existingSwagger.paths[resource]) {
            removed.push({
                path: resource,
                methods: Object
                    .keys(generatedSwagger.paths[resource])
                    .map(method => method.toUpperCase())
            });
        }
    }

    return { added, removed, updated };
};
