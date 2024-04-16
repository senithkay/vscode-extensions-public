import React, { FC } from "react";
import { IRightPanelSectionItem, RightPanelSection, RightPanelSectionItem } from "./RightPanelSection";
import { ChoreoBuildPackNames, ComponentKind, WebAppSPATypes } from "@wso2-enterprise/choreo-core";
import { getBuildpackForComponent, getTypeForDisplayType } from "../utils";

export const BuildConfigsSection: FC<{ component: ComponentKind }> = ({ component }) => {
    const buildConfigList = getBuildConfigViewList(component);

    return (
        <RightPanelSection title="Build Configurations" showDivider={false}>
            {buildConfigList.map((item) => (
                <RightPanelSectionItem key={item.label} {...item} />
            ))}
        </RightPanelSection>
    );
};

const getBuildConfigViewList = (component: ComponentKind): IRightPanelSectionItem[] => {
    const componentBuildPack = getBuildpackForComponent(component);
    const buildConfigs: IRightPanelSectionItem[] = [{ label: "Build Pack", value: componentBuildPack }];

    if (componentBuildPack !== ChoreoBuildPackNames.Docker) {
        buildConfigs.push({
            label: "Subdirectory",
            value: component.spec.source?.github?.path || component.spec.source?.bitbucket?.path,
        });
    }

    if (
        [
            ChoreoBuildPackNames.Ballerina,
            ChoreoBuildPackNames.MicroIntegrator,
            ChoreoBuildPackNames.StaticFiles,
        ].includes(componentBuildPack as ChoreoBuildPackNames)
    ) {
        // do nothing
    } else if (componentBuildPack === ChoreoBuildPackNames.Docker) {
        buildConfigs.push({ label: "Docker Context", value: component.spec?.build?.docker?.dockerContextPath });
        buildConfigs.push({ label: "Dockerfile path", value: component.spec?.build?.docker?.dockerFilePath });
        if (getTypeForDisplayType(component.spec.type) === "web-app") {
            buildConfigs.push({ label: "Port", value: component.spec?.build?.docker?.port });
        }
    } else if (WebAppSPATypes.includes(component.spec?.type as ChoreoBuildPackNames)) {
        buildConfigs.push({ label: "Build Command", value: component.spec?.build?.webapp?.buildCommand });
        buildConfigs.push({ label: "Node Version ", value: component.spec?.build?.webapp?.nodeVersion });
        buildConfigs.push({ label: "Output Directory", value: component.spec?.build?.webapp?.outputDir });
    } else {
        // Build pack type
        buildConfigs.push({ label: "Language Version", value: component.spec?.build?.buildpack?.version });
        if (getTypeForDisplayType(component.spec.type) === "web-app") {
            buildConfigs.push({ label: "Port", value: component.spec?.build?.docker?.port });
        }
    }

    return buildConfigs;
};
