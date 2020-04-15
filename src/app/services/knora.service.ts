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

@Injectable({
  providedIn: 'root'
})
export class KnoraService {
  knoraApiConnection: KnoraApiConnection;

  constructor(private appInitService: AppInitService) {
    const protocol = this.appInitService.getSettings().protocol;
    const servername = this.appInitService.getSettings().servername;
    const port = this.appInitService.getSettings().port;
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

}
