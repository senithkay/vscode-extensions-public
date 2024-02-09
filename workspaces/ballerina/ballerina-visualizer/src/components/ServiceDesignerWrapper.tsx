/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import { STNode, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { ServiceDesignerView } from "@wso2-enterprise/service-designer-view";
import { useSyntaxTreeFromRange } from "./../Hooks"
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
export function ServiceDesignerWrapper() {
    const { data, isFetching } = useSyntaxTreeFromRange(false);
    const { ballerinaRpcClient } = useVisualizerContext(); 
    const [serviceST, setServiceST] = useState<STNode>();

    useEffect(() => {
        if (!isFetching) {
            setServiceST(data?.syntaxTree as ServiceDeclaration);
        }
    }, [isFetching, data]);

    return (
        <ServiceDesignerView model={serviceST as ServiceDeclaration} rpcClient={ballerinaRpcClient.getServiceDesignerRpcClient()} typeCompletions={["string", "int"]}/>
    );
};
