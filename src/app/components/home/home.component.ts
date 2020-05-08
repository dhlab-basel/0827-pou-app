import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {catchError, finalize, map, take, tap} from 'rxjs/operators';

import {KnoraService} from '../../services/knora.service';
import {ReadResource, ReadValue, ReadLinkValue, ReadStillImageFileValue} from '@knora/api';
import {Constants} from "@knora/api/src/models/v2/Constants";

class PhotoData {
  constructor(public label: string,
              public baseurl: string,
              public filename: string) {}
}


@Component({
  selector: 'app-home',
  template: `
    <p>
      Number of Photos: {{ nPhotos }}
    </p>
    <mat-grid-list cols="5" rowHeight="1:1.5">
      <mat-grid-tile *ngFor="let x of photos">
        <mat-card>
          <mat-card-title>
            {{ x.label }}
          </mat-card-title>
          <mat-card-content>
            <img src="{{x.baseurl}}/{{x.filename}}/full/200,/0/default.jpg">
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>
    </mat-grid-list>

  `,
  styles: []
})

export class HomeComponent implements OnInit {
  page: number;
  nPhotos: number;
  photos: Array<PhotoData> = [];


  constructor(private router: Router,
              private knoraService: KnoraService) {
    this.number = 0;
  }

  getPhotos(): void {
    const paramsCnt = {
      page: '0',
    };

    this.knoraService.gravsearchQueryCount('photos_query', paramsCnt).subscribe(
      n => this.nPhotos = n
    );

    const params = {
      page: String(this.page),
    };
    this.knoraService.gravsearchQuery('photos_query', paramsCnt).subscribe(
      (photos: ReadResource[]) => {
        console.log('PHOTOS: ', this.photos);
        this.photos = photos.map((onephoto: ReadResource) => {
          let label: string = onephoto.label;
          let baseurl: string = '-';
          let filename: string = '';
          const prop = this.knoraService.pouOntology + 'physicalCopyValue';
          if (onephoto.properties.hasOwnProperty(prop)) {
            const linkval: ReadLinkValue[] = onephoto.getValuesAs(prop, ReadLinkValue);
            if (linkval.length > 0) {
              const stillimgres: ReadResource = linkval[0].linkedResource;
              const prop2 = Constants.KnoraApiV2 + Constants.Delimiter + 'hasStillImageFileValue';
              if (stillimgres.properties.hasOwnProperty(prop2)) {
                const gaga: Array<ReadStillImageFileValue> = stillimgres.getValuesAs(prop2, ReadStillImageFileValue);
                console.log('GAGA:', gaga[0])
                baseurl = gaga[0].iiifBaseUrl;
                filename = gaga[0].filename;
              }
            }
          }
          return new PhotoData(label, baseurl, filename);
        });
      }
    );

  }

  ngOnInit() {
    this.getPhotos();
  }

}
