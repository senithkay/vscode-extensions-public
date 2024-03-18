/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as React from "react";

import ErrorScreen from "./Error/Error";

export interface ErrorBoundaryProps {
    hasError: boolean;
    errorMsg?: string;
    children?: React.ReactNode;
}

export class ErrorBoundaryC extends React.Component<ErrorBoundaryProps, { hasError: boolean, errorMsg?: string }> {
    state = { hasError: false, errorMsg: "" }

    static getDerivedStateFromProps(props: ErrorBoundaryProps) {
        return {
            hasError: props.hasError,
            errorMsg: props.errorMsg
        };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
      // tslint:disable: no-console
      console.error(error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return <ErrorScreen errorMsg={this.state.errorMsg} />;
      }
      return this.props?.children;
    }
}

export const ErrorBoundary = ErrorBoundaryC;
