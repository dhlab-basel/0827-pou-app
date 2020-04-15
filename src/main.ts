import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

//
// This code reads the config file with the parameters for accessing knora
//
function bootstrapFailed(result: any) {
  console.error('bootstrap-fail', result);
}

fetch(`config/config.json`)
  .then(response => { console.log('MAIN:', response); return response.json(); })
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


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
