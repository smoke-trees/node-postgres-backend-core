import log from "../log";
import { BaseResource } from "./BaseResource";
import { IBaseRequestAction, IBaseRule, ResourceMatchResponse } from "./ISRN";
import { isValidResourceName } from "./SRNService";

export abstract class BaseRule implements IBaseRule {
    // abstract id: string | number;
    abstract effect: 'ALLOW' | 'DENY';
    abstract resourceDetails: BaseResource
    abstract action: string;

    doesRuleAllowRequest(requestAction: IBaseRequestAction) {
        if (isValidResourceName(this.resourceDetails.srn) && isValidResourceName(requestAction.resource.srn)) {
            if (this.action === requestAction.action && new RegExp(this.resourceDetails.srnRegexString!, 'gmi').test(requestAction.resource.srn)) {
                return this.effect == 'ALLOW' ? ResourceMatchResponse.ALLOW : ResourceMatchResponse.DENY
            } else {
                return ResourceMatchResponse.UNMATCHED
            }
        } else {
            log.error(`Invalid SRN: ${this.resourceDetails.srn} or ${requestAction.resource.srn}`)
            return ResourceMatchResponse.UNMATCHED
        }
    }

    // constructor(rule?: IRule) {
    //     // super()
    //     if (rule) {
    //         const { action, effect, resourceDetails } = rule
    //         this.action = action
    //         this.effect = effect
    //         this.resourceDetails = resourceDetails
    //         if (id) {
    //             this.id = id
    //         }
    //     }
    // }
}