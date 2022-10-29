import log from "../log";
import { BaseResource } from "./BaseResource";
import { IRequestActionWithResourceDetails, IRule, IRuleWithResourceDetails, ResourceMatchResponse } from "./ISRN";
import { isValidResourceName } from "./SRNService";

export abstract class BaseRule implements IRuleWithResourceDetails {
    abstract id: string | number;
    abstract effect: 'ALLOW' | 'DENY';
    abstract resourceDetails: BaseResource
    abstract action: string;

    doesRuleAllowRequest(requestAction: IRequestActionWithResourceDetails) {
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
}