import React, { FC } from "react";
import { ComponentsListActivityView } from "@wso2-enterprise/choreo-core";
import { useLinkedDirContext } from "../../context/choreo-linked-dir-ctx";
import { ComponentsEmptyView } from "./ComponentsEmptyView";
import { ComponentListItem } from "./ComponentListItem";

export const ComponentListView: FC<ComponentsListActivityView> = () => {
    const { links, isLoading } = useLinkedDirContext();

    if (links.length === 0) {
        return <ComponentsEmptyView />;
    }

    return (
        <div className="w-full flex flex-col py-2">
            {links.map((item) => (
                <ComponentListItem item={item} key={item.componentFullPath}  isListLoading={isLoading}/>
            ))}
        </div>
    );
};
