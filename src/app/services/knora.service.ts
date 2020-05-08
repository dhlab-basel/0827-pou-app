import { Injectable } from '@angular/core';
import {AppInitService} from '../app-init.service';
import {
  ApiResponseData,
  ApiResponseError, CountQueryResponse,
  KnoraApiConfig,
  KnoraApiConnection,
  LoginResponse,
  LogoutResponse,
  ReadResource
} from '@knora/api';
import {catchError, finalize, map, take, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {GravsearchTemplatesService} from './gravsearch-templates.service';

@Injectable({
  providedIn: 'root'
})
export class KnoraService {
  knoraApiConnection: KnoraApiConnection;
  pouOntology: string;
  loggedin: boolean;
  useremail: string;

  constructor(private appInitService: AppInitService,
              private queryTemplates: GravsearchTemplatesService
) {
    const protocol = this.appInitService.getSettings().protocol;
    const servername = this.appInitService.getSettings().servername;
    const port = this.appInitService.getSettings().port;
    const config = new KnoraApiConfig(protocol, servername, port, undefined, undefined, true);
    this.knoraApiConnection = new KnoraApiConnection(config);
    this.pouOntology = appInitService.getSettings().ontologyPrefix + '/ontology/0827/pou/v2#';
    this.loggedin = false;
    this.useremail = '';

  }

  login(email: string, password: string): Observable<{success: boolean, token: string, user: string}> {
    return this.knoraApiConnection.v2.auth.login('email', email, password)
      .pipe(
        catchError((err) => {
          return of(err.error.response['knora-api:error']);
        }),
        map((response) => {
          if (response instanceof ApiResponseData) {
            const apiResponse = response as ApiResponseData<LoginResponse>;
            this.loggedin = true;
            this.useremail = email;
            return {success: true, token: apiResponse.body.token, user: email};
          } else {
            return {success: false, token: response, user: '-'};
          }
        }));
  }

  logout(): Observable<string> {
    return this.knoraApiConnection.v2.auth.logout().pipe(
      catchError((err) => {
        return of(err.error.response['knora-api:error']);
      }),
      map((response) => {
        if (response instanceof ApiResponseData) {
          const apiResponse = response as ApiResponseData<LogoutResponse>;
          this.loggedin = false;
          this.useremail = '';
          return apiResponse.body.message;
        } else {
          return response;
        }
      }));
  }
  getResource(iri: string): Observable<ReadResource> {
    return this.knoraApiConnection.v2.res.getResource(iri).pipe(
      map((res: ReadResource | ApiResponseError) => {
        return res as ReadResource;
      })
    );
  }

  gravsearchQueryCount(queryname: string, params: {[index: string]: string}): Observable<number> {
    params.ontology = this.appInitService.getSettings().ontologyPrefix;
    const query = this.queryTemplates[queryname](params);
    return this.knoraApiConnection.v2.search.doExtendedSearchCountQuery(query).pipe(
      map((data: CountQueryResponse) => {
        return data.numberOfResults;
      }));
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
