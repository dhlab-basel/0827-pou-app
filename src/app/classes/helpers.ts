import {Injectable} from '@angular/core';
import {ReadDateValue, ReadLinkValue, ReadResource, ReadStillImageFileValue, ReadTextValueAsString} from '@knora/api';
import {TypeGuard} from '@knora/api/src/models/v2/resources/type-guard';
import {ReadValue} from '@knora/api/src/models/v2/resources/values/read/read-value';
import {Constants} from '@knora/api/src/models/v2/Constants';


@Injectable()
export class Helpers {

  constructor() { }

  getLinkedReadResources(res: ReadResource, linkProp: string): Array<ReadResource> {
    const result: Array<ReadResource> = [];
    if (res.properties.hasOwnProperty(linkProp)) {
      const linkvals: ReadLinkValue[] = res.getValuesAs(linkProp, ReadLinkValue);
      for (const linkval of linkvals) {
        result.push(linkval.linkedResource);
      }
    }
    return result;
  }

  getLinkedTextValueAsString(res: ReadResource, linkprop: string, valprop: string): Array<Array<string>> {
    const result: Array<Array<string>> = [];
    const linkedResources = this.getLinkedReadResources(res, linkprop);
    for (const linkedResource of linkedResources) {
      if (linkedResource.properties.hasOwnProperty(valprop)) {
        const vals = linkedResource.getValuesAs(valprop, ReadTextValueAsString);
        const tvals: Array<string> = [];
        for (const val of vals) {
          tvals.push(val.text);
        }
        result.push(tvals);
      }
    }
    return result;
  }
  /*
  This method only returns the Start date!
   */
  getLinkedDateValueAsString(res: ReadResource, linkprop: string, valprop: string): Array<Array<string>> {
    const result: Array<Array<string>> = [];
    const linkedResources = this.getLinkedReadResources(res, linkprop);
    for (const linkedResource of linkedResources) {
      if (linkedResource.properties.hasOwnProperty(valprop)) {
        const vals = linkedResource.getValuesAs(valprop, ReadDateValue);
        const tvals: Array<string> = [];
        for (const val of vals) {
          tvals.push(val.strval);
        }
        result.push(tvals);
      }
    }
    return result;
  }

  getLinkedValueAs<T extends ReadValue>(res: ReadResource,
                                        linkprop: string,
                                        valprop: string,
                                        valueType: TypeGuard.Constructor<T>): Array<Array<T>> {
    const result: Array<Array<T>> = [];
    const linkedResources = this.getLinkedReadResources(res, linkprop);
    for (const linkedResource of linkedResources) {
      const tvals: Array<T> = [];
      if (linkedResource.properties.hasOwnProperty(valprop)) {
        const vals = linkedResource.getValuesAs(valprop, valueType);
        for (const val of vals) {
          tvals.push(val);
        }
      }
      result.push(tvals);
    }
    return result;
  }
  getStillImage(res: ReadResource) {
    const prop = Constants.KnoraApiV2 + Constants.Delimiter + 'hasStillImageFileValue';
    if (res.properties.hasOwnProperty(prop)) {
      return res.getValuesAs(prop, ReadStillImageFileValue)[0];
    }
  }
  getLinkedStillImage(res: ReadResource,
                      linkProp: string): Array<ReadStillImageFileValue> {
    const result: Array<ReadStillImageFileValue> = [];
    if (res.properties.hasOwnProperty(linkProp)) {
      const linkvals: ReadLinkValue[] = res.getValuesAs(linkProp, ReadLinkValue);
      for (const linkval of linkvals) {
        const stillimgres: ReadResource = linkval.linkedResource;
        const prop2 = Constants.KnoraApiV2 + Constants.Delimiter + 'hasStillImageFileValue';
        if (stillimgres.properties.hasOwnProperty(prop2)) {
          result.push(stillimgres.getValuesAs(prop2, ReadStillImageFileValue)[0]);
        }
      }
    }
    return result;
  }

  getStringValue(res: ReadResource, prop: string, index: number = 0): string | undefined {
    if (res.properties.hasOwnProperty(prop)) {
      const strs = res.getValuesAsStringArray(prop);
      if ((index < 0) || (index >= strs.length)) return undefined;
      return strs[index];
    } else {
      return undefined;
    }
  }
}
