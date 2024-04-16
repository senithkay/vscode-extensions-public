/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import React from "react";
import { ChoreoWebviewQueryClientProvider } from "./utilities/reactQueryClient";
import { LinkedDirContextProvider } from "./context/choreo-linked-dir-ctx";
import { AuthContextProvider } from "./context/choreo-auth-ctx";
import { ComponentFormView } from "./views/ComponentFormView";
import { ComponentDetailsView } from "./views/ComponentDetailsView";
import { AccountView } from "./views/AccountView";
import { ComponentListView } from "./views/ComponentListView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
    NewComponentWebviewProps,
    WebviewProps,
    AccountActivityViewProps,
    ComponentsListActivityViewProps,
    ComponentsDetailsWebviewProps,
} from "@wso2-enterprise/choreo-core";

function ChoreoWebview(props: WebviewProps) {
    return (
        <ChoreoWebviewQueryClientProvider>
            <ErrorBoundary>
                <AuthContextProvider viewType={props.type}>
                    <main>
                        {(() => {
                            switch (props.type) {
                                case "NewComponentForm":
                                    return <ComponentFormView {...(props as NewComponentWebviewProps)} />;
                                case "ComponentDetailsView":
                                    return <ComponentDetailsView {...(props as ComponentsDetailsWebviewProps)} />;
                                case "AccountActivityView":
                                    return <AccountView {...(props as AccountActivityViewProps)} />;
                                case "ComponentsListActivityView":
                                    return (
                                        <LinkedDirContextProvider>
                                            <ComponentListView {...(props as ComponentsListActivityViewProps)} />
                                        </LinkedDirContextProvider>
                                    );
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
