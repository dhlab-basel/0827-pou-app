import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import {catchError, finalize, map, take, tap} from 'rxjs/operators';

import {KnoraService} from '../../services/knora.service';
import {ReadResource, ReadValue, ReadLinkValue, ReadStillImageFileValue, ReadDateValue, ReadTextValueAsString} from '@knora/api';
import {Constants} from '@knora/api/src/models/v2/Constants';
import {Helpers} from '../../classes/helpers';

class PhotoData {
  constructor(public photoIri: string,
              public label: string,
              public baseurl: string,
              public filename: string,
              public destination: Array<string>,
              public dateofphoto: string,
              public origFileName: string,
              public anchorpersons: Array<Array<Array<string>>>,
              public peoplepersons: Array<Array<string>>,
              public firstnames: Array<Array<Array<string>>>
              ) {}

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
        <mat-card (click)="photoClicked(x)">
          <mat-card-title>
            <h3>{{ x.origFileName }}</h3>
          </mat-card-title>
          <mat-card-content>
            <p>
            <img class="newimg" mat-card-image src="{{x.baseurl}}/{{x.filename}}/full/200,/0/default.jpg"/>
            </p>
            <table>
              <tr><td>Destination:</td><td>{{ x.destination[0] }}</td></tr>
              <tr><td>Last Name: </td><td>{{ x.peoplepersons[0] }}</td></tr>
              <tr *ngFor="let ap of x.anchorpersons"><td>Anchor:</td><td>{{ap[0] }}</td></tr>
              <tr *ngFor="let ap of x.firstnames"><td>on picture:</td><td *ngIf="x.anchorpersons[0][0] ===  ap[0]"><strong>{{ ap[0] }}</strong></td><td *ngIf="ap[0] != x.anchorpersons[0][0]">X{{ ap[0] }}X{{x.anchorpersons[0][0]}}X</td>
              </tr>
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
          const photoIri: string = onephoto.id;
          let baseurl: string = '-';
          let filename: string = '';
          let dateOfPhoto: string = '';
          let destination: Array<string> = [];
          let origFileName: Array<string> = [];
          let firstNames: Array<Array<Array<string>>> = [];
          let anchorPersons: Array<Array<Array<string>>> = [];

          const destinationProp = this.knoraService.pouOntology + 'destination';
          if (onephoto.properties.hasOwnProperty(destinationProp)) {
            const destinationVals: ReadTextValueAsString[] = onephoto.getValuesAs(destinationProp, ReadTextValueAsString);
            for (const gaga of destinationVals) {
              destination.push(gaga.strval);
            }
          }

          const prop = this.knoraService.pouOntology + 'physicalCopyValue';
          const physcop = this.helpers.getLinkedStillImage(onephoto, prop);
          baseurl = physcop[0].iiifBaseUrl;
          filename = physcop[0].filename;

          const firstNameObjectProp = this.knoraService.pouOntology + 'nameOfPersonValue';
          const firstNameProp = this.knoraService.pouOntology + 'text' ;
          const peopleProp = this.knoraService.pouOntology + 'peopleOnPicValue';
          const anchorpersProp = this.knoraService.pouOntology + 'anchorPersonValue';
          if (onephoto.properties.hasOwnProperty(peopleProp)) {
            const people = onephoto.getValuesAs(peopleProp, ReadLinkValue);
            if (people.length > 0) {
              for (var pers of people) {
                var peopleRead: ReadResource = pers.linkedResource;
                firstNames.push(this.helpers.getLinkedTextValueAsString(peopleRead, firstNameObjectProp, firstNameProp));
              }
            }
         }
          if (onephoto.properties.hasOwnProperty(anchorpersProp)) {
            const people = onephoto.getValuesAs(anchorpersProp, ReadLinkValue);
            if (people.length > 0) {
              for (var pers of people) {
                var peopleRead: ReadResource = pers.linkedResource;
                anchorPersons.push(this.helpers.getLinkedTextValueAsString(peopleRead, firstNameObjectProp, firstNameProp));
              }
            }
          }

          const turkishNameProp = this.knoraService.pouOntology + 'turkishName';
          const peoplepersons = this.helpers.getLinkedTextValueAsString(onephoto, peopleProp, turkishNameProp);


          const dateofphotoProp = this.knoraService.pouOntology + 'dateOfPhotograph';
          if (onephoto.properties.hasOwnProperty(dateofphotoProp)) {
            const dateofphoto_val: ReadDateValue[] = onephoto.getValuesAs(dateofphotoProp, ReadDateValue);
            dateOfPhoto = dateofphoto_val[0].strval;
          }

          const physProp = this.knoraService.pouOntology + 'physicalCopyValue';
          const fileNameProp = this.knoraService.pouOntology + 'fileName';
          origFileName = this.helpers.getLinkedTextValueAsString(onephoto, physProp, fileNameProp)[0];

          return new PhotoData(
            photoIri,
            label,
            baseurl,
            filename,
            destination,
            dateOfPhoto,
            origFileName[0],
            anchorPersons,
            peoplepersons,
            firstNames);
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

  photoClicked(photoData: PhotoData): void {
    console.log("CLICK DETECTED", photoData);
    const url = 'photo/' + encodeURIComponent(photoData.photoIri);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
        console.log("Navigation is successful!");
      } else {
        console.log("Navigation has failed!");
      }
    });
  }

  ngOnInit() {
    this.getPhotos();
  }

}
