import {Injectable} from '@angular/core';
import {ReadLinkValue, ReadResource, ReadTextValueAsString} from '@knora/api';


@Injectable()
export class Helpers {

  constructor() { }

  getLinkedTextValueAsString(res: ReadResource, linkprop: string, valprop: string): Array<Array<string>> {
    const result: Array<Array<string>> = [];
    if (res.properties.hasOwnProperty(linkprop)) {
      const linkvals: ReadLinkValue[] = res.getValuesAs(linkprop, ReadLinkValue);
      for (const linkval of linkvals) {
        const linkRes = linkval.linkedResource;
        const tvals: Array<string> = [];
        if (linkRes.properties.hasOwnProperty(valprop)) {
          const vals = linkRes.getValuesAs(valprop, ReadTextValueAsString);
          for (const val of vals) {
            tvals.push(val.text);
          }
        }
        result.push(tvals);
      }
    }
    return result;
  }
}
