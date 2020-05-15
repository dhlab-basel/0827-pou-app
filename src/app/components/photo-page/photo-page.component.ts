import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ReadDateValue, ReadLinkValue, ReadResource, ReadStillImageFileValue, ReadTextValueAsString} from '@knora/api';
import {Constants} from '@knora/api/src/models/v2/Constants';
import {KnoraService} from '../../services/knora.service';
import {Helpers} from '../../classes/helpers';
class PhotoPageData {
  constructor(public photoIri: string = '',
              public label: string = '',
              public baseurl: string = '',
              public filename: string = '',
              public destination: Array<string> = [],
              public dateofphoto: string = '',
              public origFileName: string = '',
              public anchorpersons: Array<Array<Array<string>>> = [],
              public peoplepersons: Array<Array<string>> = [],
              public firstnames: Array<Array<Array<string>>> = []
  ) {}

}

@Component({
  selector: 'app-photo-page',
  template: `
    <mat-progress-bar mode="indeterminate" *ngIf="showProgbar"></mat-progress-bar>
    <p>
      photo-page works! {{ photoIri }}<br/>
      from graph request: {{photo.photoIri}}<br/>
      {{photo.label}}
    </p>
  `,
  styles: []
})
export class PhotoPageComponent implements OnInit {
  private photoIri: string = '';
  private photo: PhotoPageData;
  private showProgbar: boolean = false;

  constructor(public route: ActivatedRoute,
              private knoraService: KnoraService,
              private helpers: Helpers) {
    this.photo = new PhotoPageData();
  }


  gaga() {
    this.route.params.subscribe(params => {
      this.photoIri = params.iri;
    });
  }

  getPhoto() {
    const params = {photo_iri: this.photoIri, page: 0};
    this.showProgbar = true;
    this.knoraService.gravsearchQuery('photos_query2', params).subscribe(
      (photo: ReadResource[]) => {
        this.photo = photo.map((onephoto: ReadResource) => {
          const label: string = onephoto.label;
          const photoIri: string = onephoto.id;
          let baseurl: string = '-';
          let filename: string = '';
          let dateOfPhoto: string = '';
          let destination: Array<string> = [];
          let origFileName: Array<string> = [];
          let firstNames: Array<Array<Array<string>>> = [];
          let peoplepersons: Array<Array<string>> = [];
          let anchorPersons: Array<Array<Array<string>>> = [];

          const destinationProp = this.knoraService.pouOntology + 'destination';
          if (onephoto.properties.hasOwnProperty(destinationProp)) {
            const destinationVals: ReadTextValueAsString[] = onephoto.getValuesAs(destinationProp, ReadTextValueAsString);
            for (const destval of destinationVals) {
              destination.push(destval.strval);
            }
          }
          console.log(onephoto);

          /*
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

          const firstNameObjectProp = this.knoraService.pouOntology + 'nameOfPersonValue';
          const firstNameProp = this.knoraService.pouOntology + 'text';
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
           */
          this.showProgbar = false;
          return new PhotoPageData(
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
        })[0];
      }
    );
  }

  ngOnInit() {
    this.gaga();
    this.getPhoto();
  }

}
