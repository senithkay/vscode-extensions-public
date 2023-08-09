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

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import React, { FC, Component, ErrorInfo } from "react";
import { ErrorBanner } from "../Commons/ErrorBanner";
import styled from "@emotion/styled";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

interface ErrorBoundaryCProps {
    children: React.ReactNode;
    queryClient: QueryClient;
}

interface ErrorBoundaryState {
    hasError: boolean;
    clearedCache: boolean;
}

export const ErrorBannerMargin: React.FC<any> = styled.div`
    margin-top: 15px;
`;

class ErrorBoundaryC extends Component<ErrorBoundaryCProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryCProps) {
        super(props);
        this.state = {
            hasError: false,
            clearedCache: false,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (this.state.clearedCache === false) {
            // If an exception is thrown, clear the queryClient cache and try again
            this.props.queryClient.clear();
            this.setState({ clearedCache: true });
        } else {
            // Show the error boundary if an exception is thrown even after clearing the cache
            this.setState({ hasError: true });
            ChoreoWebViewAPI.getInstance().sendTelemetryException({ error });
            console.error(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorBannerMargin>
                    <ErrorBanner errorMsg="Oops! Something went wrong. Please reopen this window and try again" />
                </ErrorBannerMargin>
            );
        }

        return (
            <div key={`Error-boundary-${this.state.clearedCache ? "with" : "with-reset"}-cache`}>
                {this.props.children}
            </div>
        );
    }
}

export const ErrorBoundary: FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    return <ErrorBoundaryC queryClient={queryClient}>{children}</ErrorBoundaryC>;
};
