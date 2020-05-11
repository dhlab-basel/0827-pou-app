import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {catchError, finalize, map, take, tap} from 'rxjs/operators';

import {KnoraService} from '../../services/knora.service';
import {ReadResource, ReadValue, ReadLinkValue, ReadStillImageFileValue, ReadDateValue, ReadTextValueAsString} from '@knora/api';
import {Constants} from '@knora/api/src/models/v2/Constants';
import {Helpers} from '../../classes/helpers';

class PhotoData {
  constructor(public label: string,
              public baseurl: string,
              public filename: string,
              public destination: Array<string>,
              public dateofphoto: string,
              public anchorpersons: Array<Array<string>>,
              public peoplepersons: Array<Array<string>>) {}
}


@Component({
  selector: 'app-home',
  template: `
    <mat-progress-bar mode="indeterminate" *ngIf="showProgbar"></mat-progress-bar>
    <p>
      Number of Photos: {{ nPhotos }}
    </p>
    <mat-grid-list cols="5" rowHeight="1:2.5">
      <mat-grid-tile *ngFor="let x of photos">
        <mat-card>
          <mat-card-title>
            <h3>{{ x.label }}</h3>
          </mat-card-title>
          <mat-card-content>
            <p>
            <img class="newimg" mat-card-image src="{{x.baseurl}}/{{x.filename}}/full/200,/0/default.jpg"/>
            </p>
            <table>
              <tr><td>Destination:</td><td>{{ x.destination[0] }}</td></tr>
              <tr *ngFor="let ap of x.anchorpersons"><td>Anchor:</td><td>{{ap[0] }}</td></tr>
              <tr *ngFor="let ap of x.peoplepersons"><td>on photo:</td><td>{{ ap[0] }}</td></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>
    </mat-grid-list>
    <mat-paginator *ngIf="nPhotos > 25" [length]="nPhotos"
                   [pageIndex]="page"
                   [pageSize]="25"
                   [pageSizeOptions]="[25]"
                   (page)="pageChanged($event)" showFirstLastButtons>
    </mat-paginator>

  `,
  styles: [
    '.mat-grid-list {margin-left: 10px; margin-right: 10px;}',
    '.mat-card-title {font-size: 12pt;}',
    '.newimg {max-width: 200px;}'
  ]
})

export class HomeComponent implements OnInit {
  page: number;
  nPhotos: number;
  photos: Array<PhotoData> = [];

  showProgbar: boolean = false;


  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private knoraService: KnoraService,
              private helpers: Helpers) {
    this.page = 0;
  }

  getPhotos(): void {
    this.showProgbar = true;
    const paramsCnt = {
      page: '0',
    };

    this.knoraService.gravsearchQueryCount('photos_query', paramsCnt).subscribe(
      n => this.nPhotos = n
    );

    const params = {
      page: String(this.page),
    };
    this.knoraService.gravsearchQuery('photos_query', params).subscribe(
      (photos: ReadResource[]) => {
        this.photos = photos.map((onephoto: ReadResource) => {
          const label: string = onephoto.label;
          let baseurl: string = '-';
          let filename: string = '';
          let dateOfPhoto: string = '';
          let destination: Array<string> = [];

          const destinationProp = this.knoraService.pouOntology + 'destination';
          if (onephoto.properties.hasOwnProperty(destinationProp)) {
            const destinationVals: ReadTextValueAsString[] = onephoto.getValuesAs(destinationProp, ReadTextValueAsString);
            for (const gaga of destinationVals) {
              destination.push(gaga.strval);
            }
          }

          const prop = this.knoraService.pouOntology + 'physicalCopyValue';
          if (onephoto.properties.hasOwnProperty(prop)) {
            const linkval: ReadLinkValue[] = onephoto.getValuesAs(prop, ReadLinkValue);
            if (linkval.length > 0) {
              const stillimgres: ReadResource = linkval[0].linkedResource;
              const prop2 = Constants.KnoraApiV2 + Constants.Delimiter + 'hasStillImageFileValue';
              if (stillimgres.properties.hasOwnProperty(prop2)) {
                const gaga: Array<ReadStillImageFileValue> = stillimgres.getValuesAs(prop2, ReadStillImageFileValue);
                baseurl = gaga[0].iiifBaseUrl;
                filename = gaga[0].filename;
              }
            }
          }

          const anchorpersProp = this.knoraService.pouOntology + 'anchorPersonValue';
          const turkishNameProp = this.knoraService.pouOntology + 'turkishName';
          const anchorpersons = this.helpers.getLinkedTextValueAsString(onephoto, anchorpersProp, turkishNameProp);

          const peopleProp = this.knoraService.pouOntology + 'peopleOnPicValue';
          const peoplepersons = this.helpers.getLinkedTextValueAsString(onephoto, peopleProp, turkishNameProp);

          const dateofphotoProp = this.knoraService.pouOntology + 'dateOfPhotograph';
          if (onephoto.properties.hasOwnProperty(dateofphotoProp)) {
            const dateofphoto_val: ReadDateValue[] = onephoto.getValuesAs(dateofphotoProp, ReadDateValue);
            dateOfPhoto = dateofphoto_val[0].strval;
          }
          return new PhotoData(label, baseurl, filename, destination, dateOfPhoto, anchorpersons, peoplepersons);
        });
        this.showProgbar = false;
      }
    );
  }

  pageChanged(event): void {
    this.page = event.pageIndex;
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {page: this.page},
        queryParamsHandling: "merge", // remove to replace all query params by provided
      });
    this.getPhotos();
  }


  ngOnInit() {
    this.getPhotos();
  }

}
