/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

interface CurlyBracesIconProps {
    isActive?: boolean;
}

export function CurlyBracesIcon({ isActive = false }: CurlyBracesIconProps) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16"
            style={{
                opacity: isActive ? 1 : 0.6,
                fill: isActive ? 'var(--vscode-button-background)' : 'var(--vscode-descriptionForeground)'
            }}
        >
            <path 
                fillRule="evenodd" 
                d="M3.413 3.421A.84.84 0 0 1 4.25 2.5a.75.75 0 0 0 0-1.5a2.34 2.34 0 0 0-2.33 2.563l.199 2.096a.9.9 0 0 1-.677.957l-.139.035a1.39 1.39 0 0 0 0 2.698l.14.035a.9.9 0 0 1 .676.957l-.2 2.096A2.34 2.34 0 0 0 4.25 15a.75.75 0 0 0 0-1.5a.84.84 0 0 1-.837-.921l.2-2.096A2.4 2.4 0 0 0 2.04 8a2.4 2.4 0 0 0 1.571-2.483zm9.175 9.158a.84.84 0 0 1-.838.921a.75.75 0 0 0 0 1.5a2.34 2.34 0 0 0 2.33-2.563l-.199-2.096a.9.9 0 0 1 .677-.957l.139-.035a1.39 1.39 0 0 0 0-2.698l-.14-.035a.9.9 0 0 1-.676-.957l.2-2.096A2.34 2.34 0 0 0 11.75 1a.75.75 0 0 0 0 1.5c.496 0 .884.427.838.921l-.2 2.096A2.4 2.4 0 0 0 13.959 8a2.4 2.4 0 0 0-1.571 2.483z" 
                clipRule="evenodd" 
            />
        </svg>
    );
} 
