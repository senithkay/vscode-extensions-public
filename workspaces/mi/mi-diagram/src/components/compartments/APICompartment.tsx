/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

interface Props {
    name: string;
}

export function APICompartment(props: React.PropsWithChildren<Props>) {
    return (
        <div style={{
            display: "flex",
            border: "1px",
            borderStyle: "solid",
            borderColor: "var(--vscode-panel-dropBorder)",
            maxHeight: "100%",
            width: "fit-content",
            flexDirection: "column"
        }}>
            <div
                style={{
                    backgroundColor: "skyblue",
                    padding: "10px",
                    borderRight: "1px",
                    borderStyle: "solid",
                    borderColor: "var(--vscode-panel-dropBorder)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <span style={{
                    color: "black",
                    textAlign: "center",
                    fontSize: "20px",
                    fontFamily: "sans-serif",
                }}
                >{props.name}</span>
            </div>
            <div style={{
                flex: 1,
                padding: "10px",
                borderLeft: "1px",
                borderStyle: "solid",
                borderColor: "var(--vscode-panel-dropBorder)",
            }}>
                {props.children}
            </div>
        </div>
    );
};

