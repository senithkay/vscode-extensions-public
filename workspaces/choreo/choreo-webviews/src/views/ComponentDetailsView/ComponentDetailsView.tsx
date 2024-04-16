import React, { FC } from "react";
import { ComponentsDetailsWebviewProps } from "@wso2-enterprise/choreo-core";
import { Divider } from "@wso2-enterprise/ui-toolkit";
import { EndpointsSection } from "./sections/EndpointsSection";
import { BuildConfigsSection } from "./sections/BuildConfigsSection";
import { HeaderSection } from "./sections/HeaderSection";
import { BuildsSection } from "./sections/BuildsSection";

export const ComponentDetailsView: FC<ComponentsDetailsWebviewProps> = (props) => {
    const { component, project, organization, directoryPath } = props;

    return (
        <div className="flex flex-row justify-center p-1 md:p-3 lg:p-4 xl:p-6">
            <div className="container">
                <div className="mx-auto max-w-7xl flex flex-col p-4">
                    <HeaderSection {...props} />
                    <Divider className="!mb-0 !mt-4" />
                    <div className="grid grid-cols-1 lg:grid-cols-4">
                        <Divider className="!mt-4 block lg:hidden" />
                        <div className="col-span-1 lg:col-span-3 lg:p-4 pt-4 lg:border-r-1 border-vsc-editorIndentGuide-background">
                            <BuildsSection {...props} />
                            {/* <div className="text-base lg:text-lg">Deployments</div> */}
                        </div>
                        <div className="col-span-1 grid grid-cols-1 lg:grid-cols-1 order-first lg:order-last lg:p-4 pt-4 gap-3">
                            <BuildConfigsSection component={component} />
                            <EndpointsSection component={component} directoryPath={directoryPath} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
