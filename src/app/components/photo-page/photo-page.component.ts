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
              public anchorpersons: Person = new Person(),
              public peoplepersons: Array<Person> = [],
  ) {}
}

class Person {
  constructor(public turkishName: string = '',
              public firstName: string = '') {}
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

  getPhoto() {
    this.route.params.subscribe(urlparams => {
      this.photoIri = urlparams.iri;
      const queryParams = {photo_iri: this.photoIri, page: '0'};
      this.showProgbar = true;
      this.knoraService.gravsearchQuery('photos_query2', queryParams).subscribe(
        (photo: ReadResource[]) => {
          this.photo = photo.map((onephoto: ReadResource) => {
            console.log(onephoto);

            const label: string = onephoto.label;
            const photoIri: string = onephoto.id;
            let baseurl: string = '-';
            let filename: string = '';
            let dateOfPhoto: string = '';
            let origFileName: Array<string> = [];
            let peoplepersons: Array<Array<string>> = [];
            let anchorPersons: Array<Array<Array<string>>> = [];

            //
            // get destination
            //
            const destinationProp = this.knoraService.pouOntology + 'destination';
            const destination = this.helpers.getStringValue(onephoto, destinationProp);

            //
            // get baseurl and imageid (filename) from physical copy
            //
            const prop = this.knoraService.pouOntology + 'physicalCopyValue';
            const physcop = this.helpers.getLinkedStillImage(onephoto, prop);
            baseurl = physcop[0].iiifBaseUrl;
            filename = physcop[0].filename;

            //
            // get turkish name and firstname of anchor person
            //
            const anchorpersProp = this.knoraService.pouOntology + 'anchorPersonValue';
            const apReadResource = this.helpers.getLinkedReadResources(onephoto, anchorpersProp)[0];
            const turkishNameProp = this.knoraService.pouOntology + 'turkishName';
            const apTurkishName = this.helpers.getStringValue(apReadResource, turkishNameProp);

            const nameOfPersonProp = this.knoraService.pouOntology + 'nameOfPersonValue';
            const nameOfPersonLinkValue = this.helpers.getLinkedValueAs(onephoto, anchorpersProp, nameOfPersonProp, ReadLinkValue);
            const nameOfPersonReadResource = nameOfPersonLinkValue[0][0].linkedResource;
            const textProp = this.knoraService.pouOntology + 'text';
            const apFirstname = this.helpers.getStringValue(nameOfPersonReadResource, textProp);

            //
            // get first names of other people on photo
            //
            const peopleOnPicProp = this.knoraService.pouOntology + 'peopleOnPicValue';
            const peopleOnPicLinkValues = this.helpers.getLinkedValueAs(onephoto, peopleOnPicProp, nameOfPersonProp, ReadLinkValue);
            for (const peopleOnPicLinkValue of peopleOnPicLinkValues) {
              const gaga = peopleOnPicLinkValue[0].linkedResource;
              const firstname = this.helpers.getStringValue(gaga, textProp);
              console.log(firstname);
            }
            //this.helpers.getLinkedTextValueAsString()
            /*
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
    });
  }

  ngOnInit() {
    this.getPhoto();
  }

}
