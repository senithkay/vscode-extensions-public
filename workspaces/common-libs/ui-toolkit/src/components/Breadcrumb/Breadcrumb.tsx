import React from "react";
import styled from "@emotion/styled";

export const ActiveSelection = styled.div`
    cursor: default;
    color: var(--vscode-list-inactiveSelectionBackground);
    line-height: unset;
`;

export const LinkSelection = styled.div`
    cursor: pointer;
    color: var(--vscode-textLink-foreground);
`;

export const BreadcrumbContainer = styled.div`
    display: flex;
    flex-direction: row;
    line-height: unset;
`;

export const Separator = styled.div`
    margin: 2px;
`;

export interface BreadcrumbProps {
    children: React.ReactNode;
    className?: string;
    maxItems?: number;
    separator?: string;
}

export default function Breadcrumbs(props: BreadcrumbProps) {
    const { children, className, maxItems = 8, separator = "/" } = props;

    const [items, activeItem] = React.useMemo(() => {
        if (!children) {
            return [null, null];
        }

        let items = React.Children.toArray(children);
        const activeItem = <ActiveSelection>{items.pop()}</ActiveSelection>;

        if (items.length > maxItems - 1) {
            items = items.splice(items.length - maxItems + 1, items.length);
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
    }, [children, maxItems, separator]);

    return (
        <BreadcrumbContainer className={className ? className : ""}>
            {items}
            {activeItem}
        </BreadcrumbContainer>
    );
}
