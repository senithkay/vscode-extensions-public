import { Codicon } from "@wso2-enterprise/ui-toolkit"
import { HorizontalListContainer, HorizontalListItem, HorizontalListItemLeftContent } from "../styles/HorizontalList"
import React from "react";


type ExpandableListProps = {
    children: React.ReactNode;
};

export const ExpandableList = ({ children }: ExpandableListProps) => {
    return (
        <HorizontalListContainer>
            {children}
        </HorizontalListContainer>
    );
};

type ExpandableListItemProps = {
    children: React.ReactNode;
};

const Item = ({ children }: ExpandableListItemProps) => {
    return (
        <HorizontalListItem>
            <HorizontalListItemLeftContent>
                {children}
            </HorizontalListItemLeftContent>
        </HorizontalListItem>
    );
};

ExpandableList.Item = Item;

export default ExpandableList;
