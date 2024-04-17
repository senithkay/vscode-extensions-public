import React, { FC } from "react";
import { RightPanelSection, RightPanelSectionItem } from "./RightPanelSection";
import { useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../../../utilities/WebViewRpc";
import { ComponentKind } from "@wso2-enterprise/choreo-core";
import { getTypeForDisplayType } from "../utils";

interface Props {
    directoryPath: string;
    component: ComponentKind;
}

export const EndpointsSection: FC<Props> = ({ directoryPath, component }) => {
    const componentType = getTypeForDisplayType(component?.spec?.type);

    const { data: endpointsResp } = useQuery({
        queryKey: ["get-service-endpoints", { directoryPath }],
        queryFn: () => ChoreoWebViewAPI.getInstance().readServiceEndpoints(directoryPath),
        enabled: !!directoryPath && componentType === "service",
    });

    return (
        <>
            {endpointsResp?.endpoints?.map((item, index) => (
                <RightPanelSection
                    key={item.name}
                    title={endpointsResp?.endpoints?.length > 1 ? `Endpoint-${index + 1}` : `Endpoint`}
                >
                    <RightPanelSectionItem label="Port" value={item.port} />
                    {item.type && <RightPanelSectionItem label="Type" value={item.type} />}
                    {item.networkVisibility && (
                        <RightPanelSectionItem label="Network Visibility" value={item.networkVisibility} />
                    )}
                    {item.context && <RightPanelSectionItem label="Context" value={item.context} />}
                    {item.schemaFilePath && (
                        <RightPanelSectionItem label="Schema File Path" value={item.schemaFilePath} />
                    )}
                </RightPanelSection>
            ))}
        </>
    );
};
