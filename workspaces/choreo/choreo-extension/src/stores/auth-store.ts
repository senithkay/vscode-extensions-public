import type { AuthState, Organization, UserInfo } from "@wso2-enterprise/choreo-core";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { ext } from "../extensionVariables";
import { contextStore } from "./context-store";
import { dataCacheStore } from "./data-cache-store";
import { getGlobalStateStore } from "./store-utils";

interface AuthStore {
	state: AuthState;
	resetState: () => void;
	loginStart: () => void;
	loginSuccess: (userInfo: UserInfo) => void;
	logout: () => void;
	getOrgById: (orgId: number) => Organization | undefined;
	getOrgByHandle: (orgHandle: string) => Organization | undefined;
	initAuth: () => Promise<void>;
}

const initialState: AuthState = { userInfo: null };

export const authStore = createStore(
	persist<AuthStore>(
		(set, get) => ({
			state: initialState,
			resetState: () => set(() => ({ state: initialState })),
			loginStart: () => set(({ state }) => ({ state: { ...state } })),
			loginSuccess: (userInfo) => {
				dataCacheStore.getState().setOrgs(userInfo.organizations);
				set(({ state }) => ({ state: { ...state, userInfo } }));
				contextStore.getState().refreshState();
			},
			logout: () => {
				ext.clients.rpcClient.signOut();
				get().resetState();
			},
			getOrgById: (orgId) => get().state.userInfo?.organizations.find((org) => org.id.toString() === orgId.toString()),
			getOrgByHandle: (orgHandle) => get().state.userInfo?.organizations.find((org) => org.handle === orgHandle),
			initAuth: async () => {
				try {
					set(({ state }) => ({ state: { ...state } }));
					const userInfo = await ext.clients.rpcClient.getUserInfo();
					userInfo ? get().loginSuccess(userInfo) : get().logout();
				} catch (err) {
					get().logout();
				}
			},
		}),
		getGlobalStateStore("auth-zustand-storage"),
	),
);

export const waitForLogin = async (): Promise<UserInfo> => {
	return new Promise((resolve) => {
		authStore.subscribe(({ state }) => {
			if (state.userInfo) {
				resolve(state.userInfo);
			}
		});
	});
};
