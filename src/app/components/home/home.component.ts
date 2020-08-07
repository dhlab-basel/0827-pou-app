import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ActivatedRoute} from '@angular/router';

import {KnoraService} from '../../services/knora.service';
import {ReadResource, ReadLinkValue, ReadDateValue} from '@knora/api';
import {Constants} from '@knora/api/src/models/v2/Constants';
import {Helpers} from '../../classes/helpers';
import {PageEvent} from '@angular/material';
import {StorageService} from '../../services/storage.service';


/**
 * This class is used to store data for the objects to be displayed. The html basically displays the properties of PhotoData objects.
 */
class PhotoData {
  constructor(public photoIri: string,
              public label: string,
              public imageBaseURL: string,
              public imageFileName: string,
              public dateOnPhoto: string,
              public turkishName: string,
              public originTown: string,
              public originKaza: string,
              public originKarye: string,
              public originMahalle: string,
              public originHouse: string,
              public photographer: string
  ) {}

  /**
   * Asks a PhotoData to create a readable string out of the different originProperties
   * @return The readable origin string
   */
  getOrigin(): string {
    let toReturn = '';
    if (this.originTown !== undefined) {
      toReturn += this.originTown + ' - ';
    }
    if (this.originKaza !== undefined) {
      toReturn += this.originKaza + ' - ';
    }
    if (this.originKarye !== undefined) {
      toReturn += this.originKarye + ' - ';
    }
    if (this.originMahalle !== undefined) {
      toReturn += this.originMahalle + ' - ';
    }
    if (this.originHouse !== undefined) {
      toReturn += this.originHouse + ' - ';
    }
    if (toReturn.length > 0) {
      toReturn = toReturn.slice(0, -3);
    }
    return toReturn;
}
}



@Component({
  selector: 'app-home',
  template: `
    <mat-progress-bar mode="indeterminate" *ngIf="showProgbar"></mat-progress-bar>
    <p>
      Number of Photos: {{ nPhotos }}
    </p>
    <div>
      <mat-form-field>
        <mat-select #peopleFilter [value] = "peopleFilters" (selectionChange)="setPeopleFilter(peopleFilter.value)" placeholder="People Details" multiple>
          <mat-option value="man">Man Alone</mat-option>
          <mat-option value="woman">Woman Alone</mat-option>
          <mat-option value="elderly">Elderly</mat-option>
          <mat-option value="children">Children</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select #photographerFilter [value] = "photographerFilters" (selectionChange)="setPhotographerFilter(photographerFilter.value)" placeholder="Photographer" multiple>
          <mat-option *ngFor="let val of photographerList" [value]="val">{{val}}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select #townFilter [value] = "townFilters" (selectionChange)="setTownFilter(townFilter.value)" placeholder="Town" multiple>
          <mat-option *ngFor="let val of townList" [value]="val">{{val}}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <!-- Creates Grid of all PhotoData objects and prints their properties -->
    <mat-grid-list cols="5" rowHeight="1:2.5">
      <mat-grid-tile *ngFor="let x of photos">
        <mat-card (click)="photoClicked(x.photoIri)">
          <mat-card-title>
            <h3 *ngIf="x.turkishName">{{ x.turkishName }}</h3>
            <h3 *ngIf="!x.turkishName">No last name</h3>
          </mat-card-title>
          <mat-card-content>
            <p>
              <img class="newimg" mat-card-image src="{{x.imageBaseURL}}/{{x.imageFileName}}/full/200,/0/default.jpg"
                   alt="Photo with iri {{x.photoIri}}"/>
            </p>
            <table>
              <tr *ngIf = "x.getOrigin().length>0">
                <td>Origin:</td>
                <td>{{ x.getOrigin()}}</td>
              </tr>
              <tr *ngIf="x.dateOnPhoto.length>0" >
                <td>Date on Photo:</td>
                <td> {{x.dateOnPhoto}}</td>
              </tr>
              <tr *ngIf = "x.photographer.length>0">
                <td>Photographer:</td>
                <td>{{x.photographer}}</td>
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
  townFilters = [];
  peopleFilters = [];
  photographerFilters = [];
  photographerList = [
    'Ahmet Naci',
    'Alexandre Papasian',
    'Aroutyoun B. Encababian',
    'Aroutyoun R. Encababian',
    'Archak B. Jacoubian',
    'Dildilian Bros.',
    "Mamuretülaziz's Police Force",
    'SH. M. Kalifa'
    ];
  // townListForCalculation = [];
  townList =  [
    'Adana',
    'Bitlis',
    'Diyarbakır',
    'Erzurum',
    'Haleb',
    'Kayseriye',
    'Mamüratülaziz',
    'Sivas',
    'Tokad'
  ];
  page: number;
  nPhotos: number;
  photos: Array<PhotoData> = [];
  showProgbar = false;


  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private knoraService: KnoraService,
              private helpers: Helpers,
              private storage: StorageService) {
    this.page = 0;
  }

  /**
   * Stores all physical copies found in PhotoData format in this.photos
   */
  getPhotos(): void {
    this.showProgbar = true;

    /**
     * Do the count search, stores the number of found elements to this.nPhotos
     */
    let query = this.createQuery();
    this.knoraService.gravsearchQueryByStringCount(query).subscribe(
      n => this.nPhotos = n
    );

    const params = {
      page: String(this.page)
    };
    query += '\nOFFSET ' + params.page;
    this.knoraService.gravsearchQueryByString(query).subscribe((physicalCopy: ReadResource[]) => {
      /**
       * The map function creates and prepares a PhotoData object for every PhysicalCopy found.
       * @return {PhotoData}: The PhotoData for a found PhysicalCopy.
       */
        this.photos = physicalCopy.map((onePhoto: ReadResource) => {
          const label: string = onePhoto.label;
          let imageBaseURL = '-';
          let imageFileName = '';
          let dateOnPhoto = '';
          let photographer = '';
          let turkishName: string;
          let originTown: string;
          let originKaza: string;
          let originKarye: string;
          let originMahalle: string;
          let originHouse: string;
          const image = this.helpers.getStillImage(onePhoto);
          imageBaseURL = image.iiifBaseUrl;
          imageFileName = image.filename;
          const photoProp = Constants.KnoraApiV2 + Constants.Delimiter + 'hasIncomingLinkValue';
          const peopleOnPicProp = this.knoraService.pouOntology + 'peopleOnPicValue';
          const originTownProp = this.knoraService.pouOntology + 'originTown';
          const originKazaProp = this.knoraService.pouOntology + 'originKaza';
          const originKaryeProp = this.knoraService.pouOntology + 'originKarye';
          const originMahalleProp = this.knoraService.pouOntology + 'originMahalle';
          const originHouseProp = this.knoraService.pouOntology + 'house';
          const turkishNameProp = this.knoraService.pouOntology + 'turkishName';
          const photographerProp = this.knoraService.pouOntology + 'photographer';
          const photo = onePhoto.getValuesAs(photoProp, ReadLinkValue);
          const photoRead = photo[0].linkedResource;
          const photoIri: string = photoRead.id;
          /*
          Get information stored on the Photograph object that has a link to this PhysicalCopy
           */
          if (photoRead.properties.hasOwnProperty(peopleOnPicProp)) {
            const people = photoRead.getValuesAs(peopleOnPicProp, ReadLinkValue);
            if (people.length > 0) {
              for (const pers of people) {
                const peopleRead: ReadResource = pers.linkedResource;
                const turkishNames = peopleRead.getValuesAsStringArray(turkishNameProp);
                if (turkishNames.length > 0 && !turkishName) {
                  turkishName = turkishNames[0];
                }
                const originTownValue = peopleRead.getValuesAsStringArray(originTownProp);
                const originKazaValue = peopleRead.getValuesAsStringArray(originKazaProp);
                const originKaryeValue = peopleRead.getValuesAsStringArray(originKaryeProp);
                const originMahalleValue = peopleRead.getValuesAsStringArray(originMahalleProp);
                const originHouseValue = peopleRead.getValuesAsStringArray(originHouseProp);
                /*
                Get origin information. As it could be available for multiple people, we disable overwriting.
                 */
                if (originTownValue.length > 0 && !originTown) {
                  originTown = originTownValue[0];
                }
                if (originKazaValue.length > 0 && !originKaza) {
                  originKaza = originKazaValue[0];
                }
                if (originKaryeValue.length > 0 && !originKarye) {
                  originKarye = originKaryeValue[0];
                }
                if (originMahalleValue.length > 0 && !originMahalle) {
                  originMahalle = originMahalleValue[0];
                }
                if (originHouseValue.length > 0 && !originHouse) {
                  originHouse = originHouseValue[0];
                }
              }
            }
          }


          const dateOnPhotoProp = this.knoraService.pouOntology + 'dateOnPhotograph';
          const datesOnPhoto = onePhoto.getValuesAs(dateOnPhotoProp, ReadDateValue);
          if (datesOnPhoto.length > 0) {
            dateOnPhoto = datesOnPhoto[0].strval.substr(10, 10);
            /* here we only consider first entry of dateOnPhotograph property. If multiple entries are interesting,
                         we should change this to an array. */
          }
          const photographerArray = onePhoto.getValuesAsStringArray(photographerProp);
          if (photographerArray.length > 0) {
            photographer = photographerArray[0]; // same as above, discarding further entries.
          }
          return new PhotoData(photoIri,
            label,
            imageBaseURL,
            imageFileName,
            dateOnPhoto,
            turkishName,
            originTown,
            originKaza,
            originKarye,
            originMahalle,
            originHouse,
            photographer);
        });
        this.showProgbar = false;
      }
    );
  }

  /**
   * Gets the new 25 photos to display, when the user changes the result page.
   * @param event The event created by click on mat-paginator
   */
  pageChanged(event: PageEvent): void {
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

  /**
   * Reroutes user to the photo page of a clicked photo
   * @param iri The iri of the photograph clicked, used to pass iri as url component.
   */
  photoClicked(iri: string): void {
    const url = 'photo/' + encodeURIComponent(iri);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
      } else {
      }
    });
  }
  setTownFilter(arr: []) {
    this.townFilters = arr;
    this.storage.photowallFilters.town = arr;
    this.getPhotos();
  }
  setPeopleFilter(arr: []) {
    this.peopleFilters = arr;
    this.storage.photowallFilters.people = arr;
    this.getPhotos();
  }
  setPhotographerFilter(arr: []) {
    this.photographerFilters = arr;
    this.storage.photowallFilters.photographer = arr;
    this.getPhotos();
  }
  /*getTownList() {
    const toReturn = [];
    let noOfTowns = 0;
    const paramsCnt = {
      page: '0',
    };
    this.knoraService.gravsearchQueryCount('person_query', paramsCnt).subscribe(
      n => {
        console.log(n);
        const noOfOffsets = n / 25;
        for (let i = 0; i <= noOfOffsets; i++) {
          this.getTownListHelper(i);
        }
      }
    );
  }
  getTownListHelper(offset: number){
    console.log('Called with', offset);
    const params = {
      page: String(offset)
    };
    this.knoraService.gravsearchQuery('person_query', params).subscribe((persons: ReadResource[]) => {
     const arrOfarr = persons.map((person: ReadResource) => {
       const originTownProp = this.knoraService.pouOntology + 'originTown';
       return person.getValuesAsStringArray(originTownProp);
     });
     const arr = [];
     for (const a of arrOfarr) {
       for (const b of a) {
         arr.push(b);
       }
     }
     this.getTownListHelperHelper(arr);
    });
  }
  getTownListHelperHelper(arr: string[]) {
    for (const s of arr) {
      this.townListForCalculation.indexOf(s) === -1 ? this.townListForCalculation.push(s) : console.log('Already in Array: ', s);
    }
  }
  logTownList() {
    console.log(this.townListForCalculation);
  } */
  createQuery() {
    let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\nPREFIX pou: <http://api.pou.test.dasch.swiss/ontology/0827/pou/v2#>\nCONSTRUCT {\n?physcop knora-api:isMainResource true .\n?physcop pou:dateOnPhotograph ?date .\n?photo pou:physicalCopy ?physcop .\n?physcop knora-api:hasStillImageFileValue ?imgfile .\n?physcop pou:photographer ?photographer .\n?photo pou:peopleOnPic ?people .\n?photo pou:dateOfPassport ?dateOfPassport .\n?people pou:originTown ?originTown .\n?people pou:originKaza ?originKaza .\n?people pou:originKarye ?originKarye .\n?people pou:originMahalle ?originMahalle .\n?people pou:house ?originHouse .\n?people pou:turkishName ?tname2 .\n} WHERE {\n?physcop a knora-api:Resource .\n?physcop a pou:PhysicalCopy .\nOPTIONAL{?physcop pou:dateOnPhotograph ?date .}\n?photo pou:physicalCopy ?physcop .\nOPTIONAL{?photo pou:dateOfPassport ?dateOfPassport . }\n?physcop knora-api:hasStillImageFileValue ?imgfile .\n?photo pou:peopleOnPic ?people .\n';
    if (this.photographerFilters.length === 0) {
        query += 'OPTIONAL{?physcop pou:photographer ?photographer .}\n';
    } else {
        query += '?physcop pou:photographer ?photographer .\n';
      }
    if (this.townFilters.length === 0) {
      query += 'OPTIONAL{?people pou:originTown ?originTown .}\n';
    } else {
        query += '?people pou:originTown ?originTown .\n';
    }
    query +=  'OPTIONAL{?people pou:originKaza ?originKaza .}\nOPTIONAL{?people pou:originKarye ?originKarye .}\nOPTIONAL{?people pou:originMahalle ?originMahalle .}\nOPTIONAL{ ?people pou:house ?originHouse .}\nOPTIONAL{?people pou:turkishName ?tname2 .}';
    if (this.townFilters.length > 0) {
      query += '\n?originTown knora-api:valueAsString ?townStr .\nFILTER regex(?townStr, "(';
      for (let town of this.townFilters) {
        if (town === 'Mamüratülaziz') {
          town = 'Mamüratülaziz|Mamüretülaziz';
        }
        if (town === 'Sivas') {
          town = 'Sivas|Sivas-Şark-i Karaağaç Sancağı';
        }
        query += town + '|';
      }
      query = query.slice(0, -1); // remove last |
      query += ')") .';
    }
    if (this.photographerFilters.length > 0) {
      query += '\n?photographer knora-api:valueAsString ?photographerStr .\n FILTER regex(?photographerStr, "(';
      for (let photographer of this.photographerFilters) {
        if (photographer === 'Archak B. Jacoubian') {
          photographer = 'Archak B. Jacoubian| Archak B. Jacoubian ';
        }
        if (photographer === 'Dildilian Bros.') {
          photographer = 'Dildilian Bros.|Dildilian Bros. Art Photographer|Fz Dildilian|Tz Dildilian';
        }
        if (photographer === 'Mamuretülaziz\'s Police Force') {
          photographer = 'Mamuretülaziz\'s Police Force|Mamuretülaziz\'s  Police Force';
        }
        query += photographer + '|';
      }
      query = query.slice(0, -1); // remove last |
      query += ')") .';
    }
    query += '\n}\nORDER BY ?date';
    return query;
  }
  loadFilters() {
    this.peopleFilters = this.storage.photowallFilters.people;
    this.townFilters = this.storage.photowallFilters.town;
    this.photographerFilters = this.storage.photowallFilters.photographer;
  }

  ngOnInit() {
    this.loadFilters();
    this.getPhotos();
  }

}
