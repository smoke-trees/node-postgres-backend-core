import { Optional } from "../util-types";

export interface IResourceNameDetails {
    projectName: string;
    serviceName: string;
    resourcePath: string;
    resourcePathSegments: string[];
    resourceId: string;
}

export interface IBaseResourceDetails {
    id: number | string;
    projectName: string;
    serviceName: string;
    resourcePath: string;
    get srn(): string;
    get resourceDetails(): IResourceNameDetails | null
    get srnRegexString(): string | null
}

export interface IPolicy {
    id: number | string;
    rules: IRuleWithResourceDetails[];
}
export type IPolicyCreate = Optional<IPolicy, "id">;

export interface IRule {
    action: string;
    effect: 'ALLOW' | 'DENY';
    resourceName: string;
}

export interface IRuleWithResourceDetails {
    action: string;
    effect: 'ALLOW' | 'DENY';
    resourceDetails: IBaseResourceDetails;
}
export interface IRequestAction {
    action: string;
    resourceName: string;
}

export interface IRequestActionWithResourceDetails {
    action: string;
    resource: IBaseResourceDetails;
}

export interface IUserGroup {
    id: string | number;
    groupId: string | number;
    userId: string | number;
}

export type IUserGroupCreate = Optional<IUserGroup, "id">;

export interface IUserPolicy {
    id: string;
    policyId: string | number;
    userId: string | number;
}

export type IUserPolicyCreate = Optional<IUserPolicy, 'id'>

export interface IGroupPolicy {
    id: string;
    policyId: string | number;
    groupId: string | number;
}

export type IGroupPolicyCreate = Optional<IGroupPolicy, 'id'>


export interface GroupPolicyInterface {
    groupToPolicyId?: string;
    groupId: string | number;
    policyId: string;
}

export interface UserGroupInterface {
    employeeToGroupId?: string;
    employeeId: string;
    groupId: string;
}

export enum ResourceMatchResponse {
    ALLOW = 'ALLOW',
    DENY = 'DENY',
    UNMATCHED = 'UNMATCHED'
}

