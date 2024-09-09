/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { convertOpenAPItoService } from "../../components/Utils/APIConversionUtils";
import { ServiceDesigner } from "@wso2-enterprise/service-designer";

interface ServiceDesignerProps {
    openAPIDefinition: OpenAPI;
}

export function APIDesigner(props: ServiceDesignerProps) {
    const { openAPIDefinition } = props;
    const service = convertOpenAPItoService(openAPIDefinition);
    return (
        <ServiceDesigner model={service} disableServiceHeader />
    )
}
