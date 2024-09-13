/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { Service, ServiceDesigner } from "@wso2-enterprise/service-designer";
import { useVisualizerContext } from "@wso2-enterprise/api-designer-rpc-client";
import { convertOpenAPIStringToObject } from "../../components/Utils/APIConversionUtils";
import styled from "@emotion/styled";

interface ServiceDesignerProps {
    fileUri: string;
}

// Add emotional styling to the component
const APIDesignerWrapper = styled.div`
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
`;

export function APIDesigner(props: ServiceDesignerProps) {
    const { fileUri } = props;
    const { rpcClient } = useVisualizerContext();
    const [ apiDefinition, setApiDefinition ] = useState<Service | undefined>(undefined);

    useEffect(() => {
        const fetchData = async () => {
            const resp = await rpcClient.getApiDesignerVisualizerRpcClient().getOpenApiContent({
                filePath: fileUri,
            });
            const convertedApiDefinition = convertOpenAPIStringToObject(resp.content, resp.type);
            setApiDefinition(convertedApiDefinition);
        };
        fetchData();
    }, [fileUri]);
    return (
        <APIDesignerWrapper>
            <ServiceDesigner model={apiDefinition} disableServiceHeader />
        </APIDesignerWrapper>
    )
}
