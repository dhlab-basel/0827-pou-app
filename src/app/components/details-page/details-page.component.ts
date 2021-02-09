import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {KnoraService} from '../../services/knora.service';
import {ReadLinkValue, ReadResource} from '@knora/api';
import {first} from 'rxjs/operators';

const imageSize = 200;
class PropStore {
  constructor(public name: string, public values: string[], public links: PropStore[]) {
  }
}
@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent implements OnInit {
  iri: string;
  props: PropStore[];
  constructor(public route: ActivatedRoute,
              private knoraService: KnoraService,
              private router: Router
              ) { }

  async ngOnInit() {
    if (!this.knoraService.loggedin) {
      this.router.navigateByUrl('/login');
    }
    this.route.params.subscribe(params => {
      this.iri = params.iri;
    });
    this.props = await this.getAllData(this.iri);
    console.log(this.props);
  }
  async getAllData(iri: string) {
    return await this.getAllDataHelper(iri);
  }
  async getAllDataHelper(iri: string): Promise<PropStore[]> {
    const toReturn = [];
    let needForDummies = false;
    const resource = await this.knoraService.getResource(iri).pipe(first()).toPromise();
    for (const i in resource.properties) {
      const thisProp = new PropStore(resource.properties[i][0].propertyLabel, [], []);
      if (resource.properties[i][0] instanceof ReadLinkValue && resource.properties[i].length > 1) { // multiple linked resources for same property
        needForDummies = true;
      }
      for (const val of resource.properties[i]) {
        if (needForDummies) {
          const dummy = new PropStore('dummy', [], []);
          const v: ReadLinkValue = val as ReadLinkValue;
          dummy.links = await this.getAllDataHelper(v.linkedResourceIri);
          thisProp.links.push(dummy);
        } else {
          if (val instanceof ReadLinkValue) {
            thisProp.links = await this.getAllDataHelper(val.linkedResourceIri);
          } else {
            thisProp.values.push(val.strval);
          }
        }
      }
      needForDummies = false;
      toReturn.push(thisProp);
    }
    return toReturn;
    /*this.knoraService.getResource(iri).subscribe(
      resource => {
        const toReturn = new PropStore('', [], []);

        return toReturn;
      }
    );*/
  }
  getImageLink(originalLink) {
    originalLink = originalLink.substring(0, originalLink.lastIndexOf('/') );
    originalLink = originalLink.substring(0, originalLink.lastIndexOf('/') );
    originalLink = originalLink.substring(0, originalLink.lastIndexOf('/') + 1 );
    originalLink += imageSize + ',/0/default.jpg';
    return originalLink;
  }

}
