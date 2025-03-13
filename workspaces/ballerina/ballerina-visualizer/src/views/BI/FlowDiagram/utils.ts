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
    
    // rename "Prompt as code" from categories to "AI" and move it to 2nd position
    const aiCategory = cloneDeep(filteredCategories.find((category) => category.metadata.label === "Prompt as code"));
    if (aiCategory) {
        aiCategory.metadata.label = "AI";
    }
    
    // remove "Prompt as code" from categories
    filteredCategories = filteredCategories.filter(
        (category) => category.metadata.label !== "Prompt as code"
    );
    
    // add ai category to 2nd position
    filteredCategories.splice(1, 0, aiCategory);
    
    // add new item to ai category called "Agent"
    if (filteredCategories[1] && filteredCategories[1].items) {
        filteredCategories[1].items.push({
            codedata: {
                node: "AGENT_CALL",
            },
            enabled: true,
            metadata: {
                label: "Agent",
                description: "Add an AI Agent to the flow",
            },
        });
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
