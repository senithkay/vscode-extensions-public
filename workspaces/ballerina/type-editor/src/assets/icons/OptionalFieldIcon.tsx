/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

interface OptionalFieldIconProps {
    isActive?: boolean;
}

export function OptionalFieldIcon({ isActive = false }: OptionalFieldIconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            {isActive ? (
                // Active state: button colors
                <g>
                    <rect x="1" y="1" width="14" height="14" rx="2" ry="2" fill="none" stroke="var(--vscode-button-background)" strokeWidth="1" />
                    <g fill="var(--vscode-button-background)">
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25c.09-.656.54-1.134 1.342-1.134c.686 0 1.314.343 1.314 1.168c0 .635-.374.927-.965 1.371c-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486c.609-.463 1.244-.977 1.244-2.056c0-1.511-1.276-2.241-2.673-2.241c-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927c.609 0 1.028-.394 1.028-.927c0-.552-.42-.94-1.029-.94c-.584 0-1.009.388-1.009.94" />
                    </g>
                </g>
            ) : (
                // Inactive state: subtle stroke color
                <g>
                    <rect x="1" y="1" width="14" height="14" rx="2" ry="2" fill="none" stroke="var(--vscode-descriptionForeground)" strokeWidth="1" opacity="0.6" />
                    <g fill="var(--vscode-descriptionForeground)" opacity="0.6">
                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25c.09-.656.54-1.134 1.342-1.134c.686 0 1.314.343 1.314 1.168c0 .635-.374.927-.965 1.371c-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486c.609-.463 1.244-.977 1.244-2.056c0-1.511-1.276-2.241-2.673-2.241c-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927c.609 0 1.028-.394 1.028-.927c0-.552-.42-.94-1.029-.94c-.584 0-1.009.388-1.009.94" />
                    </g>
                </g>
            )}
        </svg>
    );
} 
