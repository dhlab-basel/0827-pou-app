import {Component, OnInit} from '@angular/core';
import {KnoraService} from './services/knora.service';
import {ReadResource, ReadValue} from '@knora/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  title = 'test-app';

  resdata: ReadResource = new ReadResource();
  properties: Array<[string, string]> = [];

  constructor(public knoraService: KnoraService) { }

  getResource(iri: string) {
    this.knoraService.getResource(iri).subscribe((resdata: ReadResource) => {
      this.resdata = resdata;
      for (const name in resdata.properties) {
        if (resdata.properties.hasOwnProperty(name)) {
          this.properties.push([name, resdata.properties[name][0].strval]);
        }
      }
    });
  }

  ngOnInit() {
    this.getResource('http://rdfh.ch/0803/0015627fe303');
  }

}

