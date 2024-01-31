/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { Codicon } from "../Codicon/Codicon";

export interface BreadcrumbContainerInterface {
    sx?: React.CSSProperties;
}

export interface BreadcrumbProps {
    id?: string;
    className?: string;
    children: React.ReactNode;
    maxItems?: number;
    separator?: string | React.ReactNode;
    sx?: React.CSSProperties;
}

export const ActiveSelection = styled.div`
    cursor: default;
    color: var(--vscode-icon-foreground);
    line-height: unset;
    font-size: var(--vscode-font-size);
`;

export const LinkSelection = styled.div`
    cursor: pointer;
    color: var(--vscode-breadcrumb-foreground);
    font-size: var(--vscode-font-size);
    &:hover {
        color: var(--vscode-breadcrumb-focusForeground);
    }

    & .codicon-ellipsis {
        margin-top: 4px;
    }
`;

export const Separator = styled.div`
    margin: 0 2px;
    color: var(--vscode-foreground);
`;

export const BreadcrumbContainer = styled.div<BreadcrumbContainerInterface>`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    line-height: unset;
    font-size: "inherit";
    ${(props: { sx?: React.CSSProperties }) => props.sx};
`;

export function Breadcrumbs(props: BreadcrumbProps) {
    const { children, id, className, maxItems = 8, separator = "/", sx } = props;
    const [isOverflowing, setIsOverflowing] = React.useState(false);

    const [items, activeItem] = React.useMemo(() => {
        if (!children || maxItems < 1) {
            return [null, null];
        }

        let items = React.Children.toArray(children);
        const activeItem = <ActiveSelection>{items.pop()}</ActiveSelection>;

        if (maxItems === 1) {
            return [activeItem, null];
        } else if (!isOverflowing && items.length > maxItems - 1) {
            const item = (
                <React.Fragment>
                    <LinkSelection>{items[0]}</LinkSelection>
                    <Separator>{separator}</Separator>
                    <LinkSelection onClick={() => setIsOverflowing(true)}>
                        <Codicon name="ellipsis" />
                    </LinkSelection>
                    <Separator>{separator}</Separator>
                </React.Fragment>
            );
            return [item, activeItem];
        }

        items = items.map((item, index) => {
            return (
                <React.Fragment key={index}>
                    <LinkSelection>{item}</LinkSelection>
                    <Separator>{separator}</Separator>
                </React.Fragment>
            );
        });

        return [items, activeItem];
    }, [children, maxItems, separator, isOverflowing]);

    return (
        <BreadcrumbContainer id={id} className={className} sx={sx}>
            {items}
            {activeItem}
        </BreadcrumbContainer>
    );
}
