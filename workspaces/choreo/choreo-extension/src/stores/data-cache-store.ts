import { ComponentKind, DataCacheState, Organization, Project } from "@wso2-enterprise/choreo-core";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { getGlobalStateStore } from "./store-utils";

interface DataCacheStore {
    state: DataCacheState;
    setOrgs: (orgs: Organization[]) => void;
    setProjects: (orgHandle: string, projects: Project[]) => void;
    setComponents: (orgHandle: string, projectHandle: string, components: ComponentKind[]) => void;
}

// TODO: verify whether caching is working as expected
export const dataCacheStore = createStore(
    persist<DataCacheStore>(
        (set, get) => ({
            state: {},
            setOrgs: (orgs) => {
                const updatedOrgs = get().state?.orgs ?? {};
                orgs.forEach((item) => {
                    updatedOrgs[item.handle] = { projects: updatedOrgs[item.handle]?.projects || {}, data: item };
                });
                set(({ state }) => ({ state: { ...state, orgs: updatedOrgs } }));
            },
            setProjects: (orgHandle, projects) => {
                const updatedProjects = get().state?.orgs?.[orgHandle]?.projects || {};
                projects.forEach((item) => {
                    updatedProjects[item.handler] = {
                        components: updatedProjects[item.handler]?.components || {},
                        data: item,
                    };
                });

                const updatedOrgs = {
                    ...(get().state?.orgs ?? {}),
                    [orgHandle]: { ...(get().state?.orgs?.[orgHandle] ?? {}), projects: updatedProjects },
                };

                set(({ state }) => ({ state: { ...state, orgs: updatedOrgs } }));
            },
            setComponents: (orgHandle, projectHandle, components) => {
                const newComponents: { [componentHandle: string]: { data?: ComponentKind } } = {};
                components.forEach((item) => {
                    newComponents[item.metadata.name] = { data: item };
                });

                const updatedOrgs = {
                    ...(get().state?.orgs ?? {}),
                    [orgHandle]: {
                        ...(get().state?.orgs?.[orgHandle] ?? {}),
                        [projectHandle]: {
                            ...(get().state?.orgs?.[orgHandle]?.projects?.[projectHandle] ?? {}),
                            components: newComponents,
                        },
                    },
                };

                set(({ state }) => ({ state: { ...state, orgs: updatedOrgs } }));
            },
        }),
        getGlobalStateStore("data-cache-zustand-storage")
    )
);
