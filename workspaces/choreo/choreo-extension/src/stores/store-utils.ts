import { type PersistOptions, createJSONStorage } from "zustand/middleware";
import { ext } from "../extensionVariables";

export const getGlobalStateStore = (storeName: string): PersistOptions<any, any> => {
	return {
		name: storeName,
		storage: createJSONStorage(() => ({
			getItem: async (name) => {
				const value = await ext.context.globalState.get(name);
				return value ? (value as string) : "";
			},
			removeItem: (name) => ext.context.globalState.update(name, undefined),
			setItem: (name, value) => ext.context.globalState.update(name, value),
		})),
		skipHydration: true,
	};
};

export const getWorkspaceStateStore = (storeName: string): PersistOptions<any, any> => {
	return {
		name: storeName,
		storage: createJSONStorage(() => ({
			getItem: async (name) => {
				const value = await ext.context.workspaceState.get(name);
				return value ? (value as string) : "";
			},
			removeItem: (name) => ext.context.workspaceState.update(name, undefined),
			setItem: (name, value) => ext.context.workspaceState.update(name, value),
		})),
		skipHydration: true,
	};
};
