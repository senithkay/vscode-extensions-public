/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { render } from "react-dom";
import styled from "@emotion/styled";
import ChoreoWebview from "./ChoreoWebview";

export const Main: React.FC<any> = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 100vh;
`;

export function renderChoreoWebViews(
	target: HTMLDivElement,
	type: string,
	projectId?: string,
	orgName?: string,
	componentLimit?: number,
	choreoUrl?: string,
) {
	render(
		<React.StrictMode>
			<ChoreoWebview {...{ type, projectId, orgName, componentLimit, choreoUrl }} />
		</React.StrictMode>,
		target
	);
}
