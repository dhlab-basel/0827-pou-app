import { Injectable } from '@angular/core';
import {AppInitService} from '../app-init.service';
import {
  ApiResponseError,
  KnoraApiConfig,
  KnoraApiConnection,
  ReadResource
} from '@knora/api';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {GravsearchTemplatesService} from './gravsearch-templates.service';

@Injectable({
  providedIn: 'root'
})
export class KnoraService {
  knoraApiConnection: KnoraApiConnection;

  constructor(private appInitService: AppInitService,
              private queryTemplates: GravsearchTemplatesService
) {
    const protocol = this.appInitService.getSettings().protocol;
    const servername = this.appInitService.getSettings().servername;
    const port = this.appInitService.getSettings().port;
    console.log("==========> protocol=", protocol, " servrname=", servername, " port=", port);
    const config = new KnoraApiConfig(protocol, servername, port, undefined, undefined, true);
    this.knoraApiConnection = new KnoraApiConnection(config);
  }

  getResource(iri: string): Observable<ReadResource> {
    return this.knoraApiConnection.v2.res.getResource(iri).pipe(
      map((res: ReadResource | ApiResponseError) => {
        return res as ReadResource;
      })
    );
  }

  gravsearchQuery(queryname: string, params: {[index: string]: string}): Observable<Array<ReadResource>> {
    params.ontology = this.appInitService.getSettings().ontologyPrefix;
    const query = this.queryTemplates[queryname](params);
    return this.knoraApiConnection.v2.search.doExtendedSearch(query).pipe(
      map((res: Array<ReadResource>) => {
        console.log('gravsearchQuery result:', res);
        return res as Array<ReadResource>;
      }));
  }


}
