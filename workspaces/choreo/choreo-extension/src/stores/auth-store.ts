import { AuthState, Organization, UserInfo } from "@wso2-enterprise/choreo-core";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { getGlobalStateStore } from "./store-utils";
import { ext } from "../extensionVariables";
import { dataCacheStore } from "./data-cache-store";

interface AuthStore {
    state: AuthState;
    loginStart: () => void;
    loginSuccess: (userInfo: UserInfo) => void;
    logout: () => void;
    getOrgById: (orgId: number) => Organization | undefined;
    getOrgByHandle: (orgHandle: string) => Organization | undefined;
    initAuth: () => Promise<void>;
}

export const authStore = createStore(
    persist<AuthStore>(
        (set, get) => ({
            state: { userInfo: null, loading: false },
            loginStart: () => set(({ state }) => ({ state: { ...state, loading: true } })),
            loginSuccess: (userInfo) => {
                dataCacheStore.getState().setOrgs(userInfo.organizations);
                set(({ state }) => ({ state: { ...state, userInfo, loading: false } }))
            },
            logout: () => set(({ state }) => ({ state: { ...state, userInfo: null, loading: false } })),
            getOrgById: (orgId) =>
                get().state.userInfo?.organizations.find((org) => org.id.toString() === orgId.toString()),
            getOrgByHandle: (orgHandle) => get().state.userInfo?.organizations.find((org) => org.handle === orgHandle),
            initAuth: async () => {
                try {
                    set(({ state }) => ({ state: { ...state, loading: true } }));
                    const userInfo = await ext.clients.rpcClient.getUserInfo();
                    userInfo ? get().loginSuccess(userInfo) : get().logout();
                } catch (err) {
                    get().logout();
                }
            },
        }),
        getGlobalStateStore("auth-zustand-storage")
    )
);
