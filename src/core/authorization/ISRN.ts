import { Optional } from "../util-types";

export interface IBaseEntity {
    id: string | number;
    createdAt: Date;
    updatedAt: Date;
    validate: (validator: boolean, required: boolean, updatable: boolean) => string[];
}
export interface IBaseResource extends IBaseEntity {
    projectName: string;
    serviceName: string;
    resourcePath: string;
    get resourcePathSegments(): string[] | null;
    get srn(): string;
    get srnRegexString(): string | null
}

export type IResourceCreate = Optional<IBaseResource, 'id' | 'createdAt' | 'updatedAt'>;

// export interface IBasePolicy {
//     id: number | string;
//     rules: IBaseRule[];
//     doesPolicyAllowRequest(requestAction: IBaseRequestAction): ResourceMatchResponse
// }
// export type IPolicyCreate = Optional<IBasePolicy, "id">;

export interface IBaseRule {
    action: string;
    effect: 'ALLOW' | 'DENY';
    resourceDetails: IBaseResource;
    doesRuleAllowRequest(requestAction: IBaseRequestAction): ResourceMatchResponse;
}

// export type IRuleCreate = Optional<IBaseRule, "">;

export interface IBaseRequestAction {
    action: string;
    resource: IBaseResource;
}

export interface IBaseUserGroup {
    id: string | number;
    groupId: string | number;
    userId: string | number;
}

export type IBaseUserGroupCreate = Optional<IBaseUserGroup, "id">;

export interface IBaseUserPolicy {
    id: number | string;
    policyId: string | number;
    userId: string | number;
}

export type IBaseUserPolicyCreate = Optional<IBaseUserPolicy, 'id'>

export interface IBasePolicy {
    id: number | string;
    rules: IBaseRule[];
    doesPolicyAllowRequest(requestAction: IBaseRequestAction): ResourceMatchResponse
}

export type IBasePolicyCreate = Optional<IBasePolicy, 'id'>

export interface IBaseGroupPolicy {
    id: number | string;
    policyId: string | number;
    groupId: string | number;
}

export type IBaseGroupPolicyCreate = Optional<IBaseGroupPolicy, 'id'>

export enum ResourceMatchResponse {
    ALLOW = 'ALLOW',
    DENY = 'DENY',
    UNMATCHED = 'UNMATCHED'
}

export interface IBaseGroup {
    id: number | string;
}

