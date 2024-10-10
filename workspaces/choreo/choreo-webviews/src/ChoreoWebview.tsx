/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type {
	ComponentsDetailsWebviewProps,
	ComponentsListActivityViewProps,
	NewComponentWebviewProps,
	TestWebviewProps,
	WebviewProps,
} from "@wso2-enterprise/choreo-core";
import React from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthContextProvider } from "./providers/auth-ctx-provider";
import { ChoreoWebviewQueryClientProvider } from "./providers/react-query-provider";
import { ComponentDetailsView } from "./views/ComponentDetailsView";
import { ComponentFormView } from "./views/ComponentFormView";
import { ComponentListView } from "./views/ComponentListView";
import { ComponentTestView } from "./views/ComponentTestView";

function ChoreoWebview(props: WebviewProps) {
	return (
		<ChoreoWebviewQueryClientProvider type={props.type}>
			<ErrorBoundary>
				<AuthContextProvider viewType={props.type}>
					<main>
						{(() => {
							switch (props.type) {
								case "NewComponentForm":
									return <ComponentFormView {...(props as NewComponentWebviewProps)} />;
								case "TestView":
									return <ComponentTestView {...(props as TestWebviewProps)} />;
								case "ComponentDetailsView":
									return <ComponentDetailsView {...(props as ComponentsDetailsWebviewProps)} />;
								case "ComponentsListActivityView":
									return <ComponentListView {...(props as ComponentsListActivityViewProps)} />;
								default:
									return null;
							}
						})()}
					</main>
				</AuthContextProvider>
			</ErrorBoundary>
		</ChoreoWebviewQueryClientProvider>
	);
}

export default ChoreoWebview;
