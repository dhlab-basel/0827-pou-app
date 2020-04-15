import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule} from '@angular/common/http';

export interface IAppConfig {
  protocol: 'http' | 'https';
  server: string;
  ontologyPrefix: string;
  servername: string;
  port: number;
}

@Injectable()
export class AppInitService {

  static settings: IAppConfig;

  constructor(private http: HttpClient) {
  }

  Init(): Promise<any> {
    return new Promise<void>((resolve, reject) => {
      const data = window['tempConfigStorage'] as IAppConfig;
      console.log ('Init():', data)
      AppInitService.settings = data;
      resolve();
    });
  }

  public getSettings(): IAppConfig {
    return AppInitService.settings;
  }
}
