import React, { FC } from "react";
import { ComponentsListActivityViewProps } from "@wso2-enterprise/choreo-core";
import { useLinkedDirContext } from "../../context/choreo-linked-dir-ctx";
import { ComponentsEmptyView } from "./ComponentsEmptyView";
import { ComponentListItem } from "./ComponentListItem";
import { InvalidWorkspaceView } from "./InvalidWorkspaceView";

export const ComponentListView: FC<ComponentsListActivityViewProps> = ({ directoryPath }) => {
    const { links, isLoading } = useLinkedDirContext();

    if (!directoryPath) {
        return <InvalidWorkspaceView />;
    }

    if (links.length === 0) {
        return <ComponentsEmptyView />;
    }

    return (
        <div className="w-full flex flex-col py-2">
            {links.map((item, index) => (
                <div key={item.componentFullPath}>
                    <ComponentListItem item={item} isListLoading={isLoading} />
                    {index !== links?.length - 1 && <div className="h-[0.5px] bg-vsc-dropdown-border opacity-70" />}
                </div>
            ))}
        </div>
    );
};
