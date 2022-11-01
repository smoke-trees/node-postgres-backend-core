import { IBasePolicy } from "../../core/authorization/ISRN";

export interface IPolicy extends IBasePolicy {
    name: string;
}