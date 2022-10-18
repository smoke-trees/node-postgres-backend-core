import log from "../log";
import { BasePolicy } from "./BasePolicy";
import { IRequestAction, IResourceNameDetails, IRule, ResourceMatchResponse } from "./ISRN";

export const ResourceNameRegex = `^(rn::(\\w+|\\*|\\-):(\\w+|\\*|\\-):(((\\w+|\\*|\\-)(\\/(\\w+|\\*|\\-))*)*|\\*)::((\\w+|\\-)\*|\\*))$`;


export function isValidResourceName(srn: string): boolean {
  return RegExp(ResourceNameRegex, 'gmi').test(srn)
}

export function ResourceNameToRegexString(srn: string): string | null {
  if (isValidResourceName(srn)) {
    return '^(srn::' + srn.substring(5, srn.lastIndexOf('::')).split('*').join('(\\w+|\\*|\\-)').split('/').join('\\/') + srn.substring(srn.lastIndexOf('::')).replace('*', '((\\w+|\\-)\*|\\*)') + ')$'
  }
  return null
}

export function ResourceNameToResourceDetails(srn: string): IResourceNameDetails | null {
  if (isValidResourceName(srn)) {
    let r = RegExp(ResourceNameRegex, 'gmi');
    let m = r.exec(srn);
    return {
      "projectName": m![2],
      "serviceName": m![3],
      "resourcePath": m![4],
      "resourcePathSegments": m![4].split('/'),
      "resourceId": m![9],
    }
  }
  return null
}

export function doesRuleAllowRequest(rule: IRule, requestAction: IRequestAction) {
  if (isValidResourceName(rule.resourceName) && isValidResourceName(requestAction.resourceName)) {
    if (rule.action === requestAction.action && new RegExp(ResourceNameToRegexString(rule.resourceName)!, 'gmi').test(requestAction.resourceName)) {
      return rule.effect == 'ALLOW' ? ResourceMatchResponse.ALLOW : ResourceMatchResponse.DENY
    } else {
      return ResourceMatchResponse.UNMATCHED
    }
  } else {
    log.error(`Invalid SRN: ${rule.resourceName} or ${requestAction.resourceName}`)
    return ResourceMatchResponse.UNMATCHED
  }
}

export function doesPolicyAllowRequest(policy: BasePolicy, requestAction: IRequestAction): ResourceMatchResponse {
  let matchResponses: ResourceMatchResponse[] = []
  for (let rule of policy.rules) {
    let response: ResourceMatchResponse = doesRuleAllowRequest(rule, requestAction)
    /// If any rule in policy is deny, deny the request (Deny overrides allow)
    if (response === ResourceMatchResponse.DENY) {
      return ResourceMatchResponse.DENY
    }
    matchResponses.push(response)
  }
  /// If any rule in policy is allow, allow the request (allow overrides unmatched)
  if (matchResponses.includes(ResourceMatchResponse.ALLOW)) {
    return ResourceMatchResponse.ALLOW
  }
  return ResourceMatchResponse.UNMATCHED
}

export function canPerformRequest(policies: BasePolicy[], requestAction: IRequestAction): ResourceMatchResponse {
  /// USER LEVEL POLICY CHECKING
  /// User policy level matching comes first, user lvel policies override group level policies
  let matchResponses: ResourceMatchResponse[] = []
  for (let policy of policies) {
    let response: ResourceMatchResponse = doesPolicyAllowRequest(policy, requestAction)

    /// If any rule in policy is deny, deny the request (Deny overrides allow), without checking further
    if (response === ResourceMatchResponse.DENY) {
      return ResourceMatchResponse.DENY
    }
    matchResponses.push(response)
  }
  /// If any rule in policy is allow, allow the request (allow overrides unmatched)
  if (matchResponses.includes(ResourceMatchResponse.ALLOW)) {
    return ResourceMatchResponse.ALLOW
  }
  return ResourceMatchResponse.UNMATCHED
}
