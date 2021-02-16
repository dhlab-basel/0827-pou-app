import {Component, HostListener, OnInit} from '@angular/core';
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
    <div class="container">
      <mat-progress-bar mode="indeterminate" *ngIf="showProgbar"></mat-progress-bar>
      <div class="filter">
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Filters
          </mat-panel-title>
          <mat-panel-description>
            {{getDescription()}}
          </mat-panel-description>
        </mat-expansion-panel-header>
        <h3>Photographer</h3>
        <div *ngFor="let val of photographerList">
          <mat-checkbox [checked]="photographerFilters.indexOf(val) > -1" (change)="addPhotographerFilter(val)" color="primary">
            {{val}}
          </mat-checkbox>
        </div>
        <h3>Town</h3>
        <div *ngFor="let val of townList">
          <mat-checkbox [checked]="townFilters.indexOf(val) > -1" (change)="addTownFilter(val)" color="primary">
            {{val}}
          </mat-checkbox>
        </div>
        <button mat-raised-button color="primary" (click)="clearFilters()">Clear all</button>
      </mat-expansion-panel>
      </div>
      <!-- Creates Grid of all PhotoData objects and prints their properties -->
    <div class="imageBand">
      <div *ngFor="let x of photos | slice:(page%5 *5):(page%5 *5) + 5;">
              <mat-card (click)="photoClicked(x.imageBaseURL + '/' + x.imageFileName + '/full/max/0/default.jpg', x.photoIri)">
                <mat-card-title>
                  <h3 *ngIf="x.turkishName">{{ x.turkishName }}</h3>
                  <h3 *ngIf="!x.turkishName">No last name</h3>
                </mat-card-title>
                <img class="newimg" mat-card-image src="{{x.imageBaseURL}}/{{x.imageFileName}}/full/{{calcImageBound()}},/0/default.jpg"
                     alt="{{x.imageBaseURL}}/{{x.imageFileName}}/full/{{calcImageBound()}},/0/default.jpg"/>
                <mat-card-content>
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
      </div>
    </div>
        <mat-paginator *ngIf="nPhotos > 5" [length]="nPhotos"
                       [pageIndex]="page"
                       [pageSize]="5"
                       [pageSizeOptions]="[5]"
                       (page)="pageChanged($event)" showFirstLastButtons>
        </mat-paginator>
      <div (click)="closeOverlay()" id="clickedBG" class="clicked">
        <span class="close" (click)="closeOverlay()">&times;</span>
        <img class="clicked-content" id="img01" (click)="photoConfirmed()">
        <div class="caption" (click)="photoConfirmed()">Click for details</div>
      </div>
    </div>
  `,
  styles: [
    '.container {background-color: rgba(241, 231, 256, 0.4); height: 100%; width: 100%;}',
    '.mat-grid-list {}',
    '.mat-card-title {font-size: 12pt;}',
    '.mat-card {cursor: pointer; margin-left: 10px; margin-right: 10px;}',
    '.mat-card:hover {opacity: 0.7;}',
    '.clicked {display: none; position: fixed; z-index: 1; padding: 5%; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0, 0, 0, 0.9);}',
    '.clicked-content {margin: auto; display: block; max-width: 80%; max-height: 80%;}',
    '.clicked-content:hover {cursor: pointer;}',
    '.close {position:absolute; top: 15px; right: 240px; color: #f1f1f1; font-size: 40px; font-weight: bold; transition: 0.3s;}',
    '.close:hover, .close:focus {color: #bbb; text-decoration: none; cursor: pointer} ',
    '.caption {margin: auto; display: block; width: 80%; text-align: center; color: #ccc; padding: 10px 0; height: 150px}',
    '.caption:hover {cursor: pointer;}',
    '.mat-card img{ object-fit: cover; width: 100%; height: 80%;}',
    '.button {margin: 30px 30px}',
    '.mat-expansion-panel-header {background-color: rgba(103, 58, 183, 0.75);}',
    '.mat-expansion-panel {width: 30%;}',
    '.imageBand {display: flex; align-items: center;}',
    '.mat-paginator {position: fixed; left: 0; bottom: 0; width: 100%; background-color:  rgba(103, 58, 183, 0.75);}',
    '.filter {padding: 15px 15px;}'
  ]
})

export class HomeComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
  innerWidth: number;
  townFilters = [];
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
  currentClickedImage: string;

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
      page: String(Math.floor(this.page / 5))
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
    const oldVal = this.page;
    this.page = event.pageIndex;
    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: {page: this.page},
        queryParamsHandling: 'merge', // remove to replace all query params by provided
      });
    if (Math.floor(oldVal / 5) !== Math.floor(this.page / 5)) {
      this.getPhotos();
    }
  }
  photoClicked(img: string, iri: string): void {
    const clicked = document.getElementById('clickedBG');
    const imgDisplay = document.getElementById('img01') as HTMLImageElement;
    clicked.style.display = 'block';
    imgDisplay.src = img;
    this.currentClickedImage = iri;
  }
  closeOverlay() {
    const clicked = document.getElementById('clickedBG');
    clicked.style.display = 'none';
    this.currentClickedImage = undefined;
  }
  /**
   * Reroutes user to the photo page of a clicked photo
   * @param iri The iri of the photograph clicked, used to pass iri as url component.
   */
  photoConfirmed(): void {
    const url = 'photo/' + encodeURIComponent(this.currentClickedImage);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
      } else {
      }
    });
  }
  calcImageBound(): number {
    return Math.floor(this.innerWidth /5);
  }
  addTownFilter(val: string) {
    const index = this.townFilters.indexOf(val);
    if (index > -1) {
      this.townFilters.splice(index, 1);
    } else {
      this.townFilters.push(val);
    }
    const event  = new PageEvent();
    event.pageIndex = 0;
    this.pageChanged(event);
    this.getPhotos();
  }





  addPhotographerFilter(val: string) {
    const index = this.photographerFilters.indexOf(val);
    if (index > -1) {
      this.photographerFilters.splice(index, 1);
    } else {
      this.photographerFilters.push(val);
    }
    const event  = new PageEvent();
    event.pageIndex = 0;
    this.pageChanged(event);
    this.getPhotos();
  }
  getDescription() {
    let toReturn = '';
    if (this.townFilters.length > 0) {
      toReturn += 'Towns: ';
      for (const val of this.townFilters) {
        toReturn += val + ', ';
      }
      toReturn = toReturn.slice(0, -2);
    }
    if (this.photographerFilters.length > 0) {
      if (toReturn.length > 0){
        toReturn += ' | ';
      }
      toReturn += 'Photographers: ';
      for (const val of this.photographerFilters) {
        toReturn += val + ', ';
      }
      toReturn = toReturn.slice(0, -2);
    }
    return toReturn;
  }

  createQuery() {
    let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\nPREFIX pou: <http://api.0827-test-server.dasch.swiss/ontology/0827/pou/v2#>\nCONSTRUCT {\n?physcop knora-api:isMainResource true .\n?physcop pou:dateOnPhotograph ?date .\n?photo pou:physicalCopy ?physcop .\n?physcop knora-api:hasStillImageFileValue ?imgfile .\n?physcop pou:photographer ?photographer .\n?photo pou:peopleOnPic ?people .\n?photo pou:dateOfPassport ?dateOfPassport .\n?people pou:originTown ?originTown .\n?people pou:originKaza ?originKaza .\n?people pou:originKarye ?originKarye .\n?people pou:originMahalle ?originMahalle .\n?people pou:house ?originHouse .\n?people pou:turkishName ?tname2 .\n} WHERE {\n?physcop a knora-api:Resource .\n?physcop a pou:PhysicalCopy .\nOPTIONAL{?physcop pou:dateOnPhotograph ?date .}\n?photo pou:physicalCopy ?physcop .\nOPTIONAL{?photo pou:dateOfPassport ?dateOfPassport . }\n?physcop knora-api:hasStillImageFileValue ?imgfile .\n?photo pou:peopleOnPic ?people .\n';
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
    this.townFilters = this.storage.photowallFilters.town;
    this.photographerFilters = this.storage.photowallFilters.photographer;
  }
  clearFilters() {
    this.townFilters = [];
    this.photographerFilters = [];
    const event  = new PageEvent();
    event.pageIndex = 0;
    this.pageChanged(event);
    this.getPhotos();
  }

  ngOnInit() {
    if (!this.knoraService.loggedin) {
      this.router.navigateByUrl('/login');
    }
    this.innerWidth = window.innerWidth;
    this.loadFilters();
    this.getPhotos();
  }

}
