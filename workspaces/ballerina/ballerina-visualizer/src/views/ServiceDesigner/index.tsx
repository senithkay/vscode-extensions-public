/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { ServiceDesignerView } from "@wso2-enterprise/service-designer-view";

export function ServiceDesigner() {
    const { rpcClient } = useVisualizerContext();
    const [st, setSt] = React.useState<ServiceDeclaration>();

    rpcClient.onFileContentUpdate(() => {
        fetchServiceSt();
    });

    useEffect(() => {
        fetchServiceSt();
    }, []);

    const fetchServiceSt = () => {
        rpcClient.getLangServerRpcClient().getSyntaxTree().then((value) => {
            const serviceSt = value.syntaxTree as ServiceDeclaration;
            setSt(serviceSt);
        });
    }

    return (
        <>
            <ServiceDesignerView model={st} rpcClients={{serviceDesignerRpcClient: rpcClient.getServiceDesignerRpcClient(), commonRpcClient: rpcClient.getCommonRpcClient()}} />
        </>
    );
}
