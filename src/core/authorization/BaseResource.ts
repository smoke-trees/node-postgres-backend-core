import { BaseEntity } from "../BaseEntity";
import { IBaseResource } from "./ISRN";
import { isValidResourceName, ResourceNameRegex } from "./SRNService";

export abstract class BaseResource extends BaseEntity implements IBaseResource {
    abstract id: string | number;
    abstract projectName: string;
    abstract serviceName: string;
    abstract resourcePath: string;

    constructor() {
        super();
    }
    get resourcePathSegments(): string[] | null {
        if (isValidResourceName(this.srn)) {
            let r = RegExp(ResourceNameRegex, 'gmi');
            let m = r.exec(this.srn);
            return m![4].split('/');
        }
        return null
    }

    get srn() {
        return `srn::${this.projectName}:${this.serviceName}:${this.resourcePath}::${this.id}`;
    }

    // get resourceDetails(): IResourceNameDetails | null {
    //     if (isValidResourceName(this.srn)) {
    //         let r = RegExp(ResourceNameRegex, 'gmi');
    //         let m = r.exec(this.srn);
    //         return {
    //             projectName: m![2],
    //             serviceName: m![3],
    //             resourcePath: m![4],
    //             resourcePathSegments: m![4].split('/'),
    //             resourceId: m![9],
    //         }
    //     }
    //     return null
    // }

    get srnRegexString(): string | null {
        if (isValidResourceName(this.srn)) {
            return '^(srn::' + this.srn.substring(5, this.srn.lastIndexOf('::')).split('*').join('(\\w+|\\*|\\-)').split('/').join('\\/') + this.srn.substring(this.srn.lastIndexOf('::')).replace('*', '((\\w+|\\-)\*|\\*)') + ')$'
        }
        return null
    }
}