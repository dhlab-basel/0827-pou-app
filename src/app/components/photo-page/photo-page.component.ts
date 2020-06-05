import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ReadDateValue, ReadLinkValue, ReadResource, ReadStillImageFileValue, ReadTextValueAsString} from '@knora/api';
import {Constants} from '@knora/api/src/models/v2/Constants';
import {KnoraService} from '../../services/knora.service';
import {Helpers} from '../../classes/helpers';
class PhotoPageData {
  constructor(public photoIri: string = '',
              public label: string = '',
              public imageBaseURL: string = '',
              public imageFileName: string = '',
              public destination: string,
              public dateOfPhoto: string = '',
              public fileName: string = '',
              public anchorPersons: Person = new Person(),
              public peopleOnPic: Array<Person> = [],
  ) {}
}

class Roi {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(roiString: string | undefined) {
    if (roiString === undefined) {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
    } else {
      const strparts = roiString.split(',');
      if (strparts.length !== 4) {
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
      } else {
        this.x = parseInt(strparts[0], 10);
        this.y = parseInt(strparts[2], 10);
        this.w = parseInt(strparts[1], 10) - this.x;
        this.h = parseInt(strparts[3], 10) - this.y;
      }
    }
  }

  getIIIFroi(): string {
    return this.x.toString() + ',' + this.y.toString() + ',' + this.w.toString() + ',' + this.h.toString();
  }
}

// TODO: a Person can have multiple first and last names.
class Person {
  constructor(public turkishName: string = '',
              public firstName: string = '',
              public relationship: string = '',
              public roi: Roi = new Roi(undefined)
              ) {}
}

@Component({
  selector: 'app-photo-page',
  template: `
    <mat-progress-bar mode="indeterminate" *ngIf="showProgbar"></mat-progress-bar>
    <mat-grid-list cols="5" rowHeight="1:2.5">
      <mat-grid-tile>
        <mat-card>
          <mat-card-title>
            <h3>{{ photo.fileName }}</h3>
          </mat-card-title>
          <mat-card-content>
            <p>
              <img class="newimg" mat-card-image src="{{photo.imageBaseURL}}/{{photo.imageFileName}}/full/200,/0/default.jpg"/>
            </p>
            </mat-card-content>
        </mat-card>
      </mat-grid-tile>
    </mat-grid-list>
    <p *ngFor = "let x of photo.peopleOnPic">
      <img class="newimg" mat-card-image src="{{photo.imageBaseURL}}/{{photo.imageFileName}}/{{x.roi.getIIIFroi()}}/200,/0/default.jpg"/>
      {{x.firstName}} {{x.turkishName}} {{x.relationship}}
    </p>
  `,
  styles: [ ' .mat-grid-list {margin-left: 10px; margin-right: 10px;}',
    '.mat-card-title {font-size: 12pt;}',
    '.newimg {max-width: 200px;}']
})

export class PhotoPageComponent implements OnInit {
  private photoIri: string = '';
  private photo: PhotoPageData;
  private showProgbar: boolean = false;

  constructor(public route: ActivatedRoute,
              private knoraService: KnoraService,
              private helpers: Helpers) {
    this.photo = new PhotoPageData('', '','','','','','',new Person(),[]);
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
            let imageBaseURL: string = '-';
            let imageFileName: string = '';
            let dateOfPhoto: string = '';
            let fileName: Array<string> = [];
            //TODO: Should be Person objects rather than Arrays of Strings.
            let peopleOnPic: Array<Person> = [];
            let anchorPersons: Person;

            //
            // get destination
            //
            const destinationProp = this.knoraService.pouOntology + 'destination';
            const destination = this.helpers.getStringValue(onephoto, destinationProp);

            //
            // get imageBaseURL and imageid (imageFileName) from physical copy
            //
            const prop = this.knoraService.pouOntology + 'physicalCopyValue';
            const physcop = this.helpers.getLinkedStillImage(onephoto, prop);
            imageBaseURL = physcop[0].iiifBaseUrl;
            imageFileName = physcop[0].filename;

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
            anchorPersons = new Person( apTurkishName, apFirstname);
            //
            // get first names of other people on photo
            //
            const peopleOnPicProp = this.knoraService.pouOntology + 'peopleOnPicValue';
            const relationshipProp = this.knoraService.pouOntology + 'relToAnchorperson';
            const roiProp = this.knoraService.pouOntology + 'roi';
            const peopleOnPicLinkValues = this.helpers.getLinkedValueAs(onephoto, peopleOnPicProp, nameOfPersonProp, ReadLinkValue);
            const peopleOnPicValues = this.helpers.getLinkedReadResources(onephoto, peopleOnPicProp);
            let relValue: string = '';
            let roiValue: string = '';
            let firstNameValues: ReadResource;
            let firstName : string = '';
            for (let person of peopleOnPicValues) {
              relValue = this.helpers.getStringValue(person, relationshipProp);
              roiValue = this.helpers.getStringValue(person, roiProp);
              console.log(this.helpers.getStringValue(person, this.knoraService.pouOntology + 'originTown'));
              const roi = new Roi(roiValue);
              firstNameValues = this.helpers.getLinkedReadResources(person, nameOfPersonProp)[0]; // in this line we ommit all other than the first entry of all first names. Change to Array later.
              firstName = this.helpers.getStringValue(firstNameValues, textProp);
              peopleOnPic.push(new Person(apTurkishName, firstName, relValue, roi));
            }
            console.log(peopleOnPic);
            /*
            for (const peopleOnPicLinkValue of peopleOnPicLinkValues) {
              const gaga = peopleOnPicLinkValue[0].linkedResource;
              // TODO: This method seems to only return one value per person, even though a person can have multiple first names. How can we handle this?
              const firstname = this.helpers.getStringValue(gaga, textProp);
              // TODO: Do we push a Person object for every firstname a person has? Do we need to change firstnames to Arrays?
              peopleOnPic.push(new Person(apTurkishName, firstname));
            }*/
            // this.helpers.getLinkedTextValueAsString()
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
             const peopleOnPic = this.helpers.getLinkedTextValueAsString(onephoto, peopleProp, turkishNameProp);


             const dateofphotoProp = this.knoraService.pouOntology + 'dateOfPhotograph';
             if (onephoto.properties.hasOwnProperty(dateofphotoProp)) {
               const dateofphoto_val: ReadDateValue[] = onephoto.getValuesAs(dateofphotoProp, ReadDateValue);
               dateOfPhoto = dateofphoto_val[0].strval;
             }

             const physProp = this.knoraService.pouOntology + 'physicalCopyValue';
             const fileNameProp = this.knoraService.pouOntology + 'fileName';
             fileName = this.helpers.getLinkedTextValueAsString(onephoto, physProp, fileNameProp)[0];
              */
            this.showProgbar = false;
            return new PhotoPageData(
              photoIri,
              label,
              imageBaseURL,
              imageFileName,
              destination,
              dateOfPhoto,
              fileName[0],
              anchorPersons,
              peopleOnPic);
          })[0];
        }
      );
    });
  }

  ngOnInit() {
    this.getPhoto();
  }

}
