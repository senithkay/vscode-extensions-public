import { Organization } from "../../api/models";
export interface User {
    name: string;
    email: string;
    token: string;
    picURL: string;
    orgs: Organization[];
    fidp?: string;
}

export interface UserState {
    isAuthInProgress: boolean;
    isAuthenticated: boolean;
    selectedOrgHandle?: string;
    user?: User;
    error?: any;
}