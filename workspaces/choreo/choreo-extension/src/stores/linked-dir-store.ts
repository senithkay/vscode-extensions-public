import {
    ComponentKind,
    ComponentLink,
    ComponentLinkContent,
    LinkFileContent,
    LinkedDirectoryState,
    Project,
} from "@wso2-enterprise/choreo-core";
import { workspace } from "vscode";
import * as path from "path";
import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { getWorkspaceStateStore } from "./store-utils";
import { ext } from "../extensionVariables";
import { authStore } from "./auth-store";
import { dataCacheStore } from "./data-cache-store";

interface LinkedDirectoryStore {
    state: LinkedDirectoryState;
    refreshState: () => Promise<void>;
}

export const linkedDirectoryStore = createStore(
    persist<LinkedDirectoryStore>(
        (set, get) => ({
            state: { links: [] },
            refreshState: async () => {
                try {
                    set(({ state }) => ({ state: { ...state, loading: true } }));
                    const links = await getLinkedDirs(get().state?.links);
                    set(({ state }) => ({ state: { ...state, links } }));
                    const enrichedLinks = await getEnrichedLinks(links);
                    set(({ state }) => ({ state: { ...state, loading: false, links: enrichedLinks } }));
                } catch (err) {
                    set(({ state }) => ({ state: { ...state, loading: false, error: err as Error } }));
                }
            },
        }),
        getWorkspaceStateStore("linked-dir-zustand-storage")
    )
);

const getLinkedDirs = async (previousLink: ComponentLink[]) => {
    const linkFiles = await workspace.findFiles("**/.choreo/link.yaml");
    const links: ComponentLink[] = [];
    for (const linkFile of linkFiles) {
        const parsedData: LinkFileContent = yaml.load(readFileSync(linkFile.fsPath, "utf8")) as any;
        if (parsedData.component && parsedData.project && parsedData.org) {
            const linkContent: ComponentLinkContent = {
                componentHandle: parsedData.component,
                projectHandle: parsedData.project,
                orgHandle: parsedData.org,
            };
            const workspaceDir = workspace.getWorkspaceFolder(linkFile);
            if (workspaceDir) {
                const relativePath = workspace.asRelativePath(linkFile);
                const componentFullPath = path.dirname(path.dirname(linkFile.path));
                const componentRelativePath =
                    componentFullPath === workspaceDir.uri.path ? "." : workspace.asRelativePath(componentFullPath);

                const linkItem: ComponentLink = {
                    workspaceName: workspaceDir.name,
                    workspacePath: workspaceDir.uri.path,
                    componentFullPath: componentFullPath,
                    componentRelativePath: componentRelativePath,
                    linkFullPath: linkFile.path,
                    linkRelativePath: relativePath,
                    linkContent: linkContent,
                };

                const matchingPreviousLink = previousLink.find(
                    ({ linkContent: prevLinkContent }) =>
                        prevLinkContent.orgHandle === linkContent.orgHandle &&
                        prevLinkContent.projectHandle === linkContent.projectHandle &&
                        prevLinkContent.componentHandle === linkContent.componentHandle
                );

                if (matchingPreviousLink) {
                    linkItem.organization = matchingPreviousLink.organization;
                    linkItem.project = matchingPreviousLink.project;
                    linkItem.component = matchingPreviousLink.component;
                }

                links.push(linkItem);
            }
        }
    }
    links.sort((a, b) => a.linkRelativePath.localeCompare(b.linkRelativePath));
    return links;
};

const getEnrichedLinks = async (links: ComponentLink[]) => {
    const orgProjectMap = new Map<string, Project[]>();
    const projectComponentMap = new Map<string, ComponentKind[]>();
    const userOrgs = authStore.getState().state.userInfo?.organizations;
    const linksWithData: ComponentLink[] = [];
    for (const linkItem of links) {
        const matchingOrg = userOrgs?.find((item) => item.handle === linkItem.linkContent?.orgHandle);
        const linkItemWithData = linkItem;

        if (matchingOrg) {
            linkItemWithData.organization = matchingOrg;

            let projects: Project[] = [];
            if (orgProjectMap.has(linkItem.linkContent.orgHandle)) {
                projects = orgProjectMap.get(linkItem.linkContent.orgHandle) ?? [];
            } else {
                try {
                    projects = await ext.clients.rpcClient.getProjects(matchingOrg.id.toString());
                    orgProjectMap.set(linkItem.linkContent.orgHandle, projects);
                    dataCacheStore.getState().setProjects(matchingOrg.handle, projects);
                } catch (err) {
                    console.log("failed to enrich directory projects", err);
                }
            }

            const matchingProject = projects?.find((item) => item.handler === linkItem.linkContent?.projectHandle);
            if (matchingProject) {
                linkItemWithData.project = matchingProject;

                let components: ComponentKind[] = [];
                const compListKey = `${linkItem.linkContent.orgHandle}-${matchingProject.handler}`;
                if (projectComponentMap.has(compListKey)) {
                    components = projectComponentMap.get(compListKey) ?? [];
                } else {
                    try {
                        components = await ext.clients.rpcClient.getComponentList({
                            orgId: matchingOrg.id.toString(),
                            projectHandle: matchingProject.handler,
                        });
                        projectComponentMap.set(compListKey, components);
                        dataCacheStore
                            .getState()
                            .setComponents(matchingOrg.handle, matchingProject.handler, components);
                    } catch (err) {
                        console.log("failed to enrich directory components", err);
                    }
                }

                const matchingComponent = components?.find(
                    (item) => item.metadata.name === linkItem.linkContent?.componentHandle
                );

                if (matchingComponent) {
                    linkItemWithData.component = matchingComponent;
                } else {
                    linkItemWithData.component = undefined;
                }
            } else {
                linkItemWithData.project = undefined;
                linkItemWithData.component = undefined;
            }
        } else {
            linkItemWithData.organization = undefined;
            linkItemWithData.project = undefined;
            linkItemWithData.component = undefined;
        }
        linksWithData.push(linkItemWithData);
    }
    return linksWithData;
};
