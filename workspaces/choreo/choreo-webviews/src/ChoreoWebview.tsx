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
import { ComponentWizard } from "./MultiStepComponentWizard/ComponentWizard";
import { ChoreoCellView } from "./ChoreoCellView/CellView";
import { ChoreoWebviewQueryClientProvider } from "./utilities/query/query";
import { ProjectView } from "./ActivityBar/ProjectView";
// import { AccountView } from "./ActivityBar/AccountView_old";
import { LinkedDirContextProvider } from "./context/choreo-linked-dir-ctx";
import { AuthContextProvider } from "./context/choreo-auth-ctx";
import { ComponentFormView } from "./views/ComponentFormView";
import { AccountView } from "./views/AccountView";
import { ComponentListView } from "./views/ComponentListView";

import { ErrorBoundary } from "./ErrorBoundary";
import {
    NewComponentWebview,
    WebviewProps,
    AccountActivityView,
    ComponentsListActivityView,
} from "@wso2-enterprise/choreo-core";

function ChoreoWebview(props: WebviewProps) {
    return (
        <ChoreoWebviewQueryClientProvider>
            <ErrorBoundary>
                <AuthContextProvider>
                    <main>
                        {(() => {
                            switch (props.type) {
                                case "NewComponentForm":
                                    return <ComponentFormView {...(props as NewComponentWebview)} />;
                                case "AccountActivityView":
                                    return <AccountView {...(props as AccountActivityView)} />;
                                case "ComponentsListActivityView":
                                    return (
                                        <LinkedDirContextProvider>
                                            <ComponentListView {...(props as ComponentsListActivityView)} />
                                        </LinkedDirContextProvider>
                                    );
                                default:
                                    return null;
                            }
                        })()}
                        {/* {(() => {
                                if (props.type === "NewComponentForm") {
                                    return (
                                        <div className="h-screen flex flex-row justify-center">
                                            <ComponentForm {...(props as NewComponentWebview)} />
                                        </div>
                                    );
                                } else {
                                    const { type, orgName, projectId, choreoUrl } = props;
                                    return null;
                                    // return (
                                    //     <>
                                    //         {(() => {
                                    //             switch (type) {
                                    //                 // case "ChoreoCellView":
                                    //                 //     return (
                                    //                 //         <AuthContextProvider>
                                    //                 //             <ChoreoCellView
                                    //                 //                 projectId={projectId}
                                    //                 //                 orgName={orgName}
                                    //                 //             />
                                    //                 //         </AuthContextProvider>
                                    //                 //     );
                                    //                 // case "ProjectCreateForm":
                                    //                 //     return (
                                    //                 //         <ChoreoWebViewContextProvider choreoUrl={choreoUrl} ctxOrgId={orgName}>
                                    //                 //             <ProjectWizard orgId={orgName} />
                                    //                 //         </ChoreoWebViewContextProvider>
                                    //                 //     );
                                    //                 // case "ComponentCreateForm":
                                    //                 //     return (
                                    //                 //         <ChoreoWebViewContextProvider choreoUrl={choreoUrl}>
                                    //                 //             <AuthContextProvider>
                                    //                 //                 <LinkedDirContextProvider>
                                    //                 //                     <ComponentWizard />
                                    //                 //                 </LinkedDirContextProvider>
                                    //                 //             </AuthContextProvider>
                                    //                 //         </ChoreoWebViewContextProvider>
                                    //                 //     );
                                    //                 // case "ActivityBarAccountView":
                                    //                 //     return (
                                    //                 //         <ChoreoWebViewContextProvider choreoUrl={choreoUrl}>
                                    //                 //             <AuthContextProvider>
                                    //                 //                 <LinkedDirContextProvider>
                                    //                 //                     <AccountView />
                                    //                 //                 </LinkedDirContextProvider>
                                    //                 //             </AuthContextProvider>
                                    //                 //         </ChoreoWebViewContextProvider>
                                    //                 //     );
                                    //                 // case "ActivityBarProjectView":
                                    //                 //     return (
                                    //                 //         <ChoreoWebViewContextProvider choreoUrl={choreoUrl}>
                                    //                 //             <ChoreoComponentsContextProvider>
                                    //                 //                 <ProjectView />
                                    //                 //             </ChoreoComponentsContextProvider>
                                    //                 //         </ChoreoWebViewContextProvider>
                                    //                 //     );
                                    //                 default:
                                    //                     return null;
                                    //             }
                                    //         })()}
                                    //     </>
                                    // );
                                }
                            })()} */}
                    </main>
                </AuthContextProvider>
            </ErrorBoundary>
        </ChoreoWebviewQueryClientProvider>
    );
}

export default ChoreoWebview;
