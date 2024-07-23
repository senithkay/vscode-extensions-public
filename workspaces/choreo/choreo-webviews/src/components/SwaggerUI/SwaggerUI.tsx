/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { type FC } from "react";
import SwaggerUIReact, { type SwaggerUIProps } from "swagger-ui-react";
import "@wso2-enterprise/ui-toolkit/src/styles/swagger/main.scss";

export const SwaggerUI: FC<SwaggerUIProps> = (props) => {
	return <SwaggerUIReact {...props} />;
};
