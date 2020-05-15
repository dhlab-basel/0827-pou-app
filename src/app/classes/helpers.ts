import {Injectable} from '@angular/core';
import {ReadLinkValue, ReadResource, ReadTextValueAsString} from '@knora/api';
import {TypeGuard} from '@knora/api/src/models/v2/resources/type-guard';
import {ReadValue} from '@knora/api/src/models/v2/resources/values/read/read-value';


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

  getLinkedValueAs<T extends ReadValue>(res: ReadResource, linkprop: string, valprop: string, valueType: TypeGuard.Constructor<T>): Array<Array<T>> {
    const result: Array<Array<T>> = [];
    if (res.properties.hasOwnProperty(linkprop)) {
      const linkvals: ReadLinkValue[] = res.getValuesAs(linkprop, ReadLinkValue);
      for (const linkval of linkvals) {
        const linkRes = linkval.linkedResource;
        const tvals: Array<T> = [];
        if (linkRes.properties.hasOwnProperty(valprop)) {
          const vals = linkRes.getValuesAs(valprop, valueType);
          for (const val of vals) {
            tvals.push(val);
          }
        }
        result.push(tvals);
      }
    }
    return result;
  }
}
