/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import styled from "@emotion/styled";
import { ComponentCard } from "@wso2-enterprise/ui-toolkit";

const colors = {
    "GET": '#3d7eff',
    "PUT": '#49cc90',
    "POST": '#fca130',
    "DELETE": '#f93e3e',
    "PATCH": '#986ee2',
}

function getColorByMethod(method: string) {
    switch (method.toUpperCase()) {
        case "GET":
            return colors.GET;
        case "PUT":
            return colors.PUT;
        case "POST":
            return colors.POST;
        case "DELETE":
            return colors.DELETE;
        case "PATCH":
            return colors.PATCH;
        default:
            return '#FFF'; // Default color
    }
}

const Method = styled.div({
    display: 'inline-block',
    fontWeight: "bolder",
    padding: "4px 20px 4px 0"
});

const Container = styled.div({
    width: "100%",
});


export function ResourcesList(params: { components: any[] }) {

    const handleResourceClick = (comp: any) => {
        console.log("Resource Node", comp);
    };

    // Your code here
    const getResources = () => {
        const components = params.components.map((comp: any, compIndex: number) => {
            let path = "";
            comp.relativeResourcePath.forEach((res: any) => {
                path += `/${res.value}`
            })
            return (
                <ComponentCard
                    key={compIndex}
                    onClick={() => handleResourceClick(comp)}
                    sx={{
                        '&:hover, &.active': {
                            '.icon svg g': {
                                fill: 'var(--vscode-editor-foreground)'
                            },
                            backgroundColor: 'var(--vscode-pickerGroup-border)',
                            border: '1px solid var(--vscode-focusBorder)'
                        },
                        alignItems: 'center',
                        border: '1px solid var(--vscode-editor-foreground)',
                        borderRadius: 5,
                        display: 'flex',
                        height: 15,
                        justifyContent: 'space-between',
                        marginBottom: 16,
                        marginRight: 16,
                        padding: 10,
                        transition: '0.3s',
                        width: "95%"
                    }}
                >
                    <Method style={{ color: getColorByMethod(comp.functionName.value), width: "30px" }}>{comp.functionName.value}</Method>
                    <span>{path}</span>
                </ComponentCard>
            )
        });
        return components.length > 0 ? components : <p>No Resources Found</p>;
    }
    return (
        <Container>
            {getResources()}
        </Container>
    );
}
