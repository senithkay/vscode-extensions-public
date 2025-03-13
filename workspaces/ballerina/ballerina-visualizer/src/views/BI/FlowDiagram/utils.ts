/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Category, AvailableNode } from "@wso2-enterprise/ballerina-core";
import { cloneDeep } from "lodash";

/**
 * Transforms categories by filtering out unsupported nodes and reorganizing categories
 * 
 * @param categories The original categories array from the API
 * @returns Transformed categories array
 */
export const transformCategories = (categories: Category[]): Category[] => {
    // filter out some categories that are not supported in the diagram
    // TODO: these categories should be supported in the future
    const notSupportedCategories = [
        "PARALLEL_FLOW",
        "LOCK",
        "START",
        "TRANSACTION",
        "COMMIT",
        "ROLLBACK",
        "RETRY",
    ];
    
    let filteredCategories = categories.map((category) => ({
        ...category,
        items: category?.items?.filter(
            (item) =>
                !("codedata" in item) ||
                !notSupportedCategories.includes((item as AvailableNode).codedata?.node)
        ),
    })) as Category[];
    
    // remove agents from categories
    filteredCategories = filteredCategories.filter((category) => category.metadata.label !== "Agents");

    // find statement category
    const statementCategory = filteredCategories.find((category) => category.metadata.label === "Statement");

    // add new item to ai category called "Agent"
    if (statementCategory && statementCategory.items) {
        statementCategory.items.push({
            codedata: {
                module: "ai.agent",
                node: "AGENT_CALL",
                object: "Agent",
                org: "ballerinax",
                parentSymbol: "",
                symbol: "run",
                version: "0.7.13",
            },
            enabled: true,
            metadata: {
                label: "Agent",
                description: "Add an AI Agent to the flow",
            },
        });
    }

    // enrich the filtered categories with the updated statement category
    const statementCategoryIndex = filteredCategories.findIndex((category) => category.metadata.label === "Statement");
    if (statementCategoryIndex !== -1) {
        filteredCategories.splice(statementCategoryIndex, 1, statementCategory);
    }
    
    return filteredCategories;
};

/**
 * Utility function to handle AIAgent specific operations
 */
export const handleAgentOperations = {
    /**
     * Get AIAgent node configuration
     */
    getAgentConfig: (node: any) => {
        if (!node || node.codedata?.node !== "AGENT_CALL") return null;
        
        const properties = node.properties || {};
        return {
            name: properties.connection?.value || "Unknown Agent",
            model: properties.model?.value || "gpt-3.5-turbo",
            systemPrompt: properties.systemPrompt?.value || "",
            tools: properties.tools?.value || []
        };
    },
    
    /**
     * Format AIAgent node data
     */
    formatAgentData: (data: any) => {
        // Format AIAgent specific data for display or API calls
        return data;
    }
}; 
