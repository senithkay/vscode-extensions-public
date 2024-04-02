import { AuthState, Organization, UserInfo } from "@wso2-enterprise/choreo-core";
import { ext } from "../extensionVariables";
import { createStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthStore {
    state: AuthState;
    loginStart: () => void;
    loginSuccess: (userInfo: UserInfo) => void;
    logout: () => void;
    getOrgById: (orgId: number)=> Organization | undefined;
    getOrgByHandle: (orgHandle: string)=> Organization | undefined;
}

// TODO: persist user info in global state and make sure initial loading states doent cause flickering
export const authStore = createStore(
    persist<AuthStore>(
        (set, get) => ({
            state: { userInfo: null, loading: false },
            loginStart: () => set(({ state }) => ({ state: { ...state, loading: true } })),
            loginSuccess: (userInfo) => set(({ state }) => ({ state: { ...state, userInfo, loading: false } })),
            logout: () => set(({ state }) => ({ state: { ...state, userInfo: null, loading: false } })),
            getOrgById: (orgId) => get().state.userInfo?.organizations.find(org => org.id.toString() === orgId.toString()),
            getOrgByHandle: (orgHandle) => get().state.userInfo?.organizations.find(org => org.handle === orgHandle)
        }),
        {
            name: "auth-zustand-storage", // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => ({
                getItem: async (name) => {
                    const value = await ext.context.globalState.get(name);
                    console.log('vasl', value)
                    return value ? (value as string) : "";
                },
                removeItem: (name) => ext.context.globalState.update(name, undefined),
                setItem: (name, value) => ext.context.globalState.update(name, value),
            })),
            skipHydration: true,
        }
    )
);
