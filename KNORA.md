# Integration of Knora json lib

## Making knora-api-js-lib available
**IMPORTANT NOTE:** The version of _rxjs_ used in _knora-api-js-lib_ must correspond to the version used in angular!
At the moment it's best to install _knora-api-js-lib_ locally using yalc.

### Using yalc

1. Clone the knora-api-js-lib from github: ```$ git clone git@github.com:dasch-swiss/knora-api-js-lib.git```
2. Goto to the top directory and and issue the command ```$ npm i``` in order to install all required things
3. Now run ```$ npm run yalc-publish``` to publish a local version of the libraray

Then You must add _knora-api-js-lib_ to your application:

1. Issue the command ```$  yalc add @knora/api```
2. Install all dependencies: ```$ npm i```


## Reading a config file at Startup to get knora-API parameters
### 1. Create a config directory and a config file

```
mkdir src/config
```
Add a file config.json with the following content (standard configuration for local knora):
````json
{
  "protocol": "http",
  "server": "http://0.0.0.0:3333",
  "ontologyPrefix": "http://0.0.0.0:3333",
  "servername": "0.0.0.0",
  "port": 3333
}
````

Now You have to add this directory as asset to the file ```angular.json``` in order to include it
to the distribution and make it accessible to the local server:

```json
            "assets": [
              "src/favicon.ico",
              "src/assets",
              "src/config" <-------- Add this line
            ],

```
### 2. Modify file main.ts

In order to read the config file at startup of the app, we have to modify main.ts.
Add the following code to main.ts:

```typescript
//
// This code reads the config file with the parameters for accessing the knora API
//
function bootstrapFailed(result: any) {
  console.error('bootstrap-fail', result);
}

fetch(`config/config.json`) // location of the config file -> read it
  .then(response => response.json())
  .then(config => {
    if (!config || !config['server']) {
      bootstrapFailed(config);
      return;
    }

    // store the response somewhere that your ConfigService can read it.
    window['tempConfigStorage'] = config;

    // console.log('config', config);

    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch(err => bootstrapFailed(err));
  })
  .catch(bootstrapFailed);

```
### 3. Add the app/app-init.service.ts file
We have to add a service that will access the config parameter. For that we add a file named ```app-init.service.ts```
to the app directory. It has the following content:

```typescript
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
      AppInitService.settings = data;
      resolve();
    });
  }

  public getSettings(): IAppConfig {
    return AppInitService.settings;
  }
}

```

### 4. Modify the file ```app.module.ts```
The file ```app.module.ts``` has to be modified to add the support to these new features:
First modify the import line by adding APP_INITIALIZER
```typescript
import {APP_INITIALIZER, NgModule} from '@angular/core';
```
The add just below the import statments:
```typescript
import {AppInitService} from './app-init.service';
import {HttpClientModule} from '@angular/common/http';

export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}
```
Now add the HttpClientModule to the imports:
```typescript
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule, <---------------
      ],
```
Now add the providers:
```typescript
providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true
    }
  ],
```
The final file shoul look like this (it Youstarted from a scratch):
```typescript
import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AppInitService} from './app-init.service';
import {HttpClientModule} from '@angular/common/http';

export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## Creating a KNORA-API service

### 1. Generate the service file
From the console issue the command
```bash
ng generate service services/knora
```
This generates an angular service template in the (new) directory services. There are 2 files:
- ```knora.service.ts```  Here comes the actual code
- ```knora.service.spec.ts``` This s for implementing unit tests

### 2. Add the AppInit service which accesses the config file for KNORA API
Add the following:
```typescript
import { Injectable } from '@angular/core';
import {AppInitService} from '../app-init.service'; // <-------------------

@Injectable({
  providedIn: 'root'
})
export class KnoraService {

  constructor(private appInitService: AppInitService) { } // <------------------
}
```
Now we can access the data from the config file:
```typescript
import { Injectable } from '@angular/core';
import {AppInitService} from '../app-init.service'; // <-------------------

@Injectable({
  providedIn: 'root'
})
export class KnoraService {

  constructor(private appInitService: AppInitService) {
    const protocol = this.appInitService.getSettings().protocol; // <-----
    const servername = this.appInitService.getSettings().servername; // <-------
    const port = this.appInitService.getSettings().port;  // <--------
  } 
}
```
And now we can open the connection to Knora by adding the following lines:
```typescript
import { Injectable } from '@angular/core';
import {AppInitService} from '../app-init.service';
import {                 // <---- add these lines to import the knora-json-lib
  KnoraApiConfig,        // <----
  KnoraApiConnection,    // <----
} from '@knora/api';     // <----

@Injectable({
  providedIn: 'root'
})
export class KnoraService {
  knoraApiConnection: KnoraApiConnection; // <----- provide a class member that holds the Knora connection

  constructor(private appInitService: AppInitService) {
    const protocol = this.appInitService.getSettings().protocol;
    const servername = this.appInitService.getSettings().servername;
    const port = this.appInitService.getSettings().port;
    const config = new KnoraApiConfig( // <--- make a configuration object
        protocol,
        servername,
        port,
        undefined,
        undefined,
        true); 
    this.knoraApiConnection = new KnoraApiConnection(config); // <--- open the connection
  }
}
```


ng generate class classes/sparql-prep
-> sparql-prep class
Copy code from mls.... :-)

```typescript
import { Injectable } from "@angular/core";
enum Status { COPY, INWATCH, OUTWATCH, INSIDE }

@Injectable()
export class SparqlPrep {

  constructor() { }

  compile(template: string, params: {[index: string]: string}) {
    let output: string = '';
    let status: Status = Status.COPY;
    let token: string = '';
    let skip: boolean = false;
    for (const c of template) {
      if (status === Status.COPY) {
        if (c === '{') {
          status = Status.INWATCH;
        } else {
          if (!skip) output += c;
        }
      } else if (status === Status.INWATCH) {
        if (c === '{') {
          status = Status.INSIDE;
        } else {
          status = Status.COPY;
          if (!skip) output += '{' + c;
        }
      } else if (status === Status.INSIDE) {
        if (c === '}') {
          status = Status.OUTWATCH;
        } else {
          token += c;
        }
      } else if (status === Status.OUTWATCH) {
        if (c === '}') {
          status = Status.COPY;
          token = token.trim();
          // Process token here!!!!
          if (token.charAt(0) === '#') {
            const parts = token.split(/\s+/);
            if (parts[0] === '#if') {
              if (params.hasOwnProperty(parts[1])) {
                skip = false;
              } else {
                skip = true;
              }
            } else if (parts[0] === '#else') {
              skip = !skip;
            } else if (parts[0] === '#endif') {
              skip = false;
            } else {
              // issue error
            }
          }
          else {
            if (params.hasOwnProperty(token)) {
              output += params[token];
            }
          }
          token = '';
        } else {
          token += '}' + c;
        }
      }
    }
    return output;
  }
}
```


ng generate service services/gravsearch-templates
Add:
```typescript
import { Injectable } from '@angular/core';
import { SparqlPrep} from '../classes/sparql-prep';

@Injectable({
  providedIn: 'root'
})

export class GravsearchTemplatesService {

  constructor(private sparqlPrep: SparqlPrep) { }

  book_query(params: {[index: string]: string}): string {
    const result = this.sparqlPrep.compile(`
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX incunabula: <{{ ontology }}/ontology/0803/incunabula/simple/v2#>
    CONSTRUCT {
      ?book knora-api:isMainResource true .
      ?book incunabula:title ?title .
      ?book incunabula:pubdate ?pubdate .
    } WHERE {
      ?book a knora-api:Resource .
      ?book a incunabula:book .
      ?book incunabula:title ?title .
      FILTER regex(?title, "{{ book_title }}", "i") .
      OPTIONAL { ?book incunabula:pubdate ?pubdate . }
    }
    `, params);
    return result;
  }
}

```

in app.module.ts add `SparqlPrep,` to the providers:
```typescript
import {SparqlPrep} from './classes/sparql-prep';
```
and
```typescript
providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true
    }
    },
    SparqlPrep,
  ],
```
and


```typescript
providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true
    },
    SparqlPrep,
  ],
```

add to app.components.ts:
```typescript
export class AppComponent implements OnInit  {
  @ViewChild('searchTerm', {static: false})
  private searchTerm: ElementRef;
```
and:

```typescript
searchres: Array<ReadResource> = [];
```

```typescript
  searchEvent(): void {
    console.log("searchEvent:", this.searchTerm.nativeElement.value);
    const params = {
      book_title: this.searchTerm.nativeElement.value
    };
    this.knoraService.gravsearchQuery('book_query', params).subscribe((searchres: Array<ReadResource>) => {
      console.log('RESDATA:: ', searchres);
      this.searchres = searchres;
    });
  }
```
add to app.component.html:
```angular2html
<input #searchTerm
       class="form-control"
/>
<button (click)="searchEvent($event)">Search</button>
<table>
  <tr *ngFor="let sr of searchres">
    <td>{{sr.label}}</td>
  </tr>
</table>
```
