import React, { FC } from "react";
import { ComponentsListActivityViewProps } from "@wso2-enterprise/choreo-core";
import { useLinkedDirContext } from "../../context/choreo-linked-dir-ctx";
import { ComponentsEmptyView } from "./ComponentsEmptyView";
import { ComponentListItem } from "./ComponentListItem";
import { InvalidWorkspaceView } from "./InvalidWorkspaceView";
import { useAutoAnimate } from '@formkit/auto-animate/react'

export const ComponentListView: FC<ComponentsListActivityViewProps> = ({ directoryPath }) => {
    const { links, isLoading, activeComponentPath } = useLinkedDirContext();
    const [componentListRef] = useAutoAnimate({duration: 100});

    if (!directoryPath) {
        return <InvalidWorkspaceView />;
    }

    if (links.length === 0) {
        return <ComponentsEmptyView />;
    }

    return (
        <div className="w-full flex flex-col py-2" ref={componentListRef}>
            {links.map((item, index) => (
                <div key={item.componentFullPath}>
                    <ComponentListItem item={item} isListLoading={isLoading} opened={activeComponentPath === item.componentFullPath}/>
                    {index !== links?.length - 1 && <div className="h-[0.5px] bg-vsc-dropdown-border opacity-70" />}
                </div>
            ))}
        </div>
    );
};
