export interface ITokenPayload {
    id:string;
    email:string;
    iat:number;
    exp:number;
    iss:string;
}

export type { ITokenPayload as ITokenPayloadType }