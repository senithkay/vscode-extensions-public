/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Tag } from "../../../commandTemplates/models/tag.model";
import { Command } from "../../../commandTemplates/models/command.enum";
import { injectTags } from "../../../commandTemplates/utils/utils";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";

interface UseFooterLogicParams {
    rpcClient: BallerinaRpcClient;
}

export const useFooterLogic = ({
    rpcClient,
}: UseFooterLogicParams) => {

    const loadGeneralTags = async (): Promise<Tag[]> => {
        return [
            {
                display: "@test",
                value: "test",
                kind: "general",
            },
            {
                display: "@second",
                value: "second",
                kind: "general",
            },
        ];
    };

    const injectPlaceholderTags = async (command: Command, templateId: string): Promise<void> => {
        switch (command) {
            case Command.Tests:
                switch (templateId) {
                    case "tests-for-service":
                        const serviceNames = (await rpcClient.getAiPanelRpcClient().getServiceNames()).mentions;
                        injectTags(
                            command,
                            templateId,
                            "servicename",
                            serviceNames.map((serviceName) => {
                                return {
                                    display: `@${serviceName}`,
                                    value: serviceName,
                                    kind: "placeholder-specific",
                                };
                            })
                        );
                        break;
                    case "tests-for-function":
                        const resourceNames = (await rpcClient.getAiPanelRpcClient().getResourceMethodAndPaths())
                            .mentions;
                        injectTags(
                            command,
                            templateId,
                            "methodPath",
                            resourceNames.map((resourceName) => {
                                return {
                                    display: `@${resourceName}`,
                                    value: resourceName,
                                    kind: "placeholder-specific",
                                };
                            })
                        );
                        break;
                }
                break;
            case Command.DataMap:
                switch (templateId) {
                    case "mappings-for-records":
                        const recordNames = (await rpcClient.getBIDiagramRpcClient().getRecordNames()).mentions;
                        injectTags(
                            command,
                            templateId,
                            "inputRecords",
                            recordNames.map((recordName) => {
                                return {
                                    display: `@${recordName}`,
                                    value: recordName,
                                    kind: "placeholder-specific",
                                };
                            })
                        );
                        injectTags(
                            command,
                            templateId,
                            "outputRecord",
                            recordNames.map((recordName) => {
                                return {
                                    display: `@${recordName}`,
                                    value: recordName,
                                    kind: "placeholder-specific",
                                };
                            })
                        );
                        break;
                    case "mappings-for-function":
                        const functionNames = (await rpcClient.getBIDiagramRpcClient().getFunctionNames()).mentions;
                        injectTags(
                            command,
                            templateId,
                            "functionName",
                            functionNames.map((functionName) => {
                                return {
                                    display: `@${functionName}`,
                                    value: functionName,
                                    kind: "placeholder-specific",
                                };
                            })
                        );
                        break;
                }
                break;
        }
    };

    return {
        loadGeneralTags,
        injectPlaceholderTags,
    };
};
