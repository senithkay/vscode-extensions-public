import React from "react";
import styled from "@emotion/styled";
import { Codicon } from "../Codicon/Codicon";

export const ActiveSelection = styled.div`
    cursor: default;
    color: var(--vscode-list-inactiveSelectionBackground);
    line-height: unset;
`;

export const LinkSelection = styled.div`
    cursor: pointer;
    color: var(--vscode-textLink-foreground);

    & .codicon-ellipsis {
        margin-top: 4px;
    }
`;

export const BreadcrumbContainer = styled.div`
    display: flex;
    flex-direction: row;
    line-height: unset;
`;

export const Separator = styled.div`
    margin: 2px;
    color: var(--vscode-foreground);
`;

export interface BreadcrumbProps {
    children: React.ReactNode;
    className?: string;
    maxItems?: number;
    separator?: string | React.ReactNode;
}

export default function Breadcrumbs(props: BreadcrumbProps) {
    const { children, className, maxItems = 8, separator = "/" } = props;
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
        <BreadcrumbContainer className={className ? className : ""}>
            {items}
            {activeItem}
        </BreadcrumbContainer>
    );
}
