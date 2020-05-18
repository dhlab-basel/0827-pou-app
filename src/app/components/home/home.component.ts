import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';
import {catchError, finalize, map, take, tap} from 'rxjs/operators';

import {KnoraService} from '../../services/knora.service';
import {ReadResource, ReadValue, ReadLinkValue, ReadStillImageFileValue, ReadDateValue, ReadTextValueAsString} from '@knora/api';
import {Constants} from '@knora/api/src/models/v2/Constants';
import {Helpers} from '../../classes/helpers';

class PhotoData {
  constructor(public photoIri: string,
              public label: string,
              public imageBaseURL: string,
              public imageFileName: string,
              public destination: Array<string>,
              public dateOfPhoto: string,
              public origFileName: string,
              public anchorPersonFirstNames: Array<Array<Array<string>>>,
              public lastNamesOnPic: Array<Array<string>>,
              public firstNamesOnPic: Array<Array<Array<string>>>
  ) {
  }

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
              <img class="newimg" mat-card-image src="{{x.imageBaseURL}}/{{x.imageFileName}}/full/200,/0/default.jpg"/>
            </p>
            <table>
              <tr>
                <td>Destination:</td>
                <td>{{ x.destination[0] }}</td>
              </tr>
              <tr>
                <td>Last Name:</td>
                <td>{{ x.lastNamesOnPic[0] }}</td>
              </tr>
              <tr *ngFor="let ap of x.firstNamesOnPic">
                <td>on picture:</td>
                <td *ngIf="x.anchorPersonFirstNames[0][0][0] ===  ap[0][0]"><strong>{{ ap[0] }}</strong></td>
                <td *ngIf="ap[0][0] != x.anchorPersonFirstNames[0][0][0]">{{ ap[0] }}</td>
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
        this.photos = photos.map((onePhoto: ReadResource) => {
          const label: string = onePhoto.label;
          const photoIri: string = onePhoto.id;
          let imageBaseURL: string = '-';
          let imageFileName: string = '';
          let dateOfPhoto: string = '';
          let destination: Array<string> = [];
          let fileName: Array<string> = [];
          let firstNamesOnPic: Array<Array<Array<string>>> = [];
          let anchorPersonFirstNames: Array<Array<Array<string>>> = [];

          const destinationProp = this.knoraService.pouOntology + 'destination';
          if (onePhoto.properties.hasOwnProperty(destinationProp)) {
            const destinationVals: ReadTextValueAsString[] = onePhoto.getValuesAs(destinationProp, ReadTextValueAsString);
            for (const dest of destinationVals) {
              destination.push(dest.strval);
            }
          }

          const physicalCopyProp = this.knoraService.pouOntology + 'physicalCopyValue';
          const physcop = this.helpers.getLinkedStillImage(onePhoto, physicalCopyProp);
          imageBaseURL = physcop[0].iiifBaseUrl;
          imageFileName = physcop[0].filename;

          const firstNameObjectProp = this.knoraService.pouOntology + 'nameOfPersonValue';
          const firstNameProp = this.knoraService.pouOntology + 'text';
          const peopleOnPicProp = this.knoraService.pouOntology + 'peopleOnPicValue';
          const anchorPersProp = this.knoraService.pouOntology + 'anchorPersonValue';
          if (onePhoto.properties.hasOwnProperty(peopleOnPicProp)) {
            const people = onePhoto.getValuesAs(peopleOnPicProp, ReadLinkValue);
            if (people.length > 0) {
              for (let pers of people) {
                const peopleRead: ReadResource = pers.linkedResource;
                firstNamesOnPic.push(this.helpers.getLinkedTextValueAsString(peopleRead, firstNameObjectProp, firstNameProp));
              }
            }
          }
          if (onePhoto.properties.hasOwnProperty(anchorPersProp)) {
            const people = onePhoto.getValuesAs(anchorPersProp, ReadLinkValue);
            if (people.length > 0) {
              for (let pers of people) {
                const peopleRead: ReadResource = pers.linkedResource;
                anchorPersonFirstNames.push(this.helpers.getLinkedTextValueAsString(peopleRead, firstNameObjectProp, firstNameProp));
              }
            }
          }

          const turkishNameProp = this.knoraService.pouOntology + 'turkishName';
          const lastNamesOnPic = this.helpers.getLinkedTextValueAsString(onePhoto, peopleOnPicProp, turkishNameProp);


          const dateOfPhotoProp = this.knoraService.pouOntology + 'dateOfPhotograph';
          if (onePhoto.properties.hasOwnProperty(dateOfPhotoProp)) {
            const dateOfPhotoVal: ReadDateValue[] = onePhoto.getValuesAs(dateOfPhotoProp, ReadDateValue);
            dateOfPhoto = dateOfPhotoVal[0].strval;
          }
          const fileNameProp = this.knoraService.pouOntology + 'fileName';
          fileName = this.helpers.getLinkedTextValueAsString(onePhoto, physicalCopyProp, fileNameProp)[0];

          return new PhotoData(
            photoIri,
            label,
            imageBaseURL,
            imageFileName,
            destination,
            dateOfPhoto,
            fileName[0],
            anchorPersonFirstNames,
            lastNamesOnPic,
            firstNamesOnPic);
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
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
    this.getPhotos();
  }

  photoClicked(photoData: PhotoData): void {
    // console.log('CLICK DETECTED', photoData);
    const url = 'photo/' + encodeURIComponent(photoData.photoIri);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
        console.log('Navigation is successful!');
      } else {
        console.log('Navigation has failed!');
      }
    });
  }

  ngOnInit() {
    this.getPhotos();
  }

}
