/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import type { ComponentKind, DataCacheState, Organization, Project } from "@wso2-enterprise/choreo-core";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { getGlobalStateStore } from "./store-utils";

interface DataCacheStore {
	state: DataCacheState;
	setOrgs: (orgs: Organization[]) => void;
	setProjects: (orgHandle: string, projects: Project[]) => void;
	getProjects: (orgHandle: string) => Project[];
	setComponents: (orgHandle: string, projectHandle: string, components: ComponentKind[]) => void;
	getComponents: (orgHandle: string, projectHandle: string) => ComponentKind[];
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
				const updatedProjects: {
					[projectHandle: string]: {
						data?: Project;
						components?: { [componentHandle: string]: { data?: ComponentKind } };
					};
				} = {};
				projects.forEach((item) => {
					updatedProjects[item.handler] = {
						components: get().state?.orgs?.[orgHandle]?.projects?.[item.handler]?.components || {},
						data: item,
					};
				});

				const updatedOrgs = {
					...(get().state?.orgs ?? {}),
					[orgHandle]: { ...(get().state?.orgs?.[orgHandle] ?? {}), projects: updatedProjects },
				};

				set(({ state }) => ({ state: { ...state, orgs: updatedOrgs } }));
			},
			getProjects: (orgHandle) => {
				const projectList = Object.values(get().state.orgs?.[orgHandle]?.projects ?? {})
					.filter((item) => item.data)
					.map((item) => item.data);
				return projectList as Project[];
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
						projects: {
							...(get().state?.orgs?.[orgHandle]?.projects ?? {}),
							[projectHandle]: {
								...(get().state?.orgs?.[orgHandle]?.projects?.[projectHandle] ?? {}),
								components: newComponents,
							},
						},
					},
				};

				set(({ state }) => ({ state: { ...state, orgs: updatedOrgs } }));
			},
			getComponents: (orgHandle, projectHandle) => {
				const componentList = Object.values(get().state.orgs?.[orgHandle]?.projects?.[projectHandle]?.components ?? {})
					.filter((item) => item.data)
					.map((item) => item.data);
				return componentList as ComponentKind[];
			},
		}),
		getGlobalStateStore("data-cache-zustand-storage-v1"),
	),
);
