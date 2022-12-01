export interface ChoreoSession {
    loginStatus: boolean;
    choreoUser?: string;
    choreoAccessToken?: string;
    choreoCookie?: string;
    choreoRefreshToken?: string;
    choreoLoginTime?: Date;
    tokenExpirationTime?: number;
}