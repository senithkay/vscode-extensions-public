import { Action } from "redux";

import { Organization } from "../../api/models";

export const LOGIN_START = "LOGIN_START";
export type LOGIN_START = typeof LOGIN_START;

export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export type LOGIN_SUCCESS = typeof LOGIN_SUCCESS;

export const LOGIN_FAILURE = "LOGIN_FAILURE";
export type LOGIN_FAILURE = typeof LOGIN_FAILURE;

export const LOGOUT_START = "LOGOUT_START";
export type LOGOUT_START = typeof LOGOUT_START;

export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export type LOGOUT_SUCCESS = typeof LOGOUT_SUCCESS;

export const LOGOUT_FAILURE = "LOGOUT_FAILURE";
export type LOGOUT_FAILURE = typeof LOGOUT_FAILURE;

export const IDP_STORE_SUCCESS = "IDP_STORE_SUCCESS";
export type IDP_STORE_SUCCESS = typeof IDP_STORE_SUCCESS;

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
    user?: User;
    error?: any;
}

export interface LoginStartAction extends Action<LOGIN_START> {}

export interface IdpStoreSuccessAction extends Action<IDP_STORE_SUCCESS> {
    fidp: string
}

export interface LoginSuccessAction extends Action<LOGIN_SUCCESS> {
    user: User
}

export interface LoginFailureAction extends Action<LOGIN_FAILURE> {
    error: Error
}

export interface LogOutStartAction extends Action<LOGOUT_START> {}

export interface LogOutSuccessAction extends Action<LOGOUT_SUCCESS> {}

export interface LogOutFailureAction extends Action<LOGOUT_FAILURE> {
    error: Error
}

export type UserAction = LoginStartAction | LoginSuccessAction | LoginFailureAction
    | LogOutStartAction | LogOutSuccessAction | LogOutFailureAction | IdpStoreSuccessAction;
