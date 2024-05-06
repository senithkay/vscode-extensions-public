/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// In React, error boundaries do not catch errors inside event handlers.
// React's error boundaries are designed to catch errors in the rendering phase,
// in lifecycle methods, and in constructors of the whole tree below them. 
import React, { ReactNode } from "react";
import { ErrorScreen } from "./Error/Error";

export interface ErrorBoundaryProps {
    errorMsg?: string;
    children?: ReactNode;
    issueUrl?: string;
}

import { ErrorBoundary as EB } from "react-error-boundary";

export function ErrorBoundary(props: ErrorBoundaryProps) {
    const Fallback = () => <ErrorScreen errorMsg={props.errorMsg} issueUrl={props.issueUrl} />;
    return (
        <EB FallbackComponent={Fallback}>
            {props.children}
        </EB>
    );
}
