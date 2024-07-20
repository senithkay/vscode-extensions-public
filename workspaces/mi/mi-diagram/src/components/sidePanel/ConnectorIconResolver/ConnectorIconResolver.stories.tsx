/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { ConnectorIconResolver } from "./ConnectorIconResolver";

// Default export defining the component's metadata
export default {
    title: 'ConnectorIconResolver',
    component: ConnectorIconResolver,
};

export const Default = () => {
    return <ConnectorIconResolver iconUrl="https://mi-connectors.wso2.com/icons/salesforce.png" />;
};
