import {
    ComponentLink,
    ComponentLinkContent,
    LinkFileContent,
    LinkedDirectoryState,
} from "@wso2-enterprise/choreo-core";
import { Uri, workspace } from "vscode";
import * as path from "path";
import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import { ext } from "../extensionVariables";
import { createStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LinkedDirectoryStore {
    state: LinkedDirectoryState;
    refreshState: () => Promise<void>;
}

// TODO: persist user info in global state and make sure initial loading states doent cause flickering
export const linkedDirectoryStore = createStore(
    persist<LinkedDirectoryStore>(
        (set, get) => ({
            state: { links: [] },
            refreshState: async () => {
                try {
                    set(({ state }) => ({ state: { ...state, loading: true } }));
                    const links = await getLinkedComponents();
                    set(({ state }) => ({ state: { ...state, loading: false, links } }));
                } catch (err) {
                    set(({ state }) => ({ state: { ...state, loading: false, error: err as Error } }));
                }
            },
        }),
        {
            name: "linked-dir-zustand-storage", // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => ({
                getItem: async (name) => {
                    const value = await ext.context.workspaceState.get(name);
                    return value ? (value as string) : "";
                },
                removeItem: (name) => ext.context.workspaceState.update(name, undefined),
                setItem: (name, value) => ext.context.workspaceState.update(name, value),
            })),
            skipHydration: true,
        }
    )
);

const getLinkedComponents = async () => {
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

                links.push({
                    workspaceName: workspaceDir.name,
                    workspacePath: workspaceDir.uri.path,
                    componentFullPath: componentFullPath,
                    componentRelativePath: componentRelativePath,
                    linkFullPath: linkFile.path,
                    linkRelativePath: relativePath,
                    linkContent: linkContent,
                } as ComponentLink);
            }
        }
    }
    return links;
};
