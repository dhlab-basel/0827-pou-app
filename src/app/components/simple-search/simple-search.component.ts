import {Component, OnDestroy, OnInit} from '@angular/core';
import {StorageService} from '../../services/storage.service';
import {ReadResource} from '@knora/api';
import {KnoraService} from '../../services/knora.service';
import {last} from 'rxjs/operators';
import {Helpers} from '../../classes/helpers';
import {Router} from '@angular/router';

class Result {
  iri: string;
  names: string[];
  lastNames: string[];
  towns: string[];
  fathersNames: string[];
  constructor(iri: string, names: string[], lastNames: string[], towns: string[], fathersNames: string[]) {
    this.iri = iri;
    this.names = names;
    this.lastNames = lastNames;
    this.towns = towns;
    this.fathersNames = fathersNames;
  }
}


@Component({
  selector: 'app-simple-search',
  templateUrl: './simple-search.component.html',
  styleUrls: ['./simple-search.component.scss']
})

export class SimpleSearchComponent implements OnInit, OnDestroy {
  results: Result[] = [];
  nameInput: string;
  lastNameInput: string;
  fathersNameInput: string;
  townInput: string;
  arrivalInput: number;
  precisionInput: string;
  countRes = -1 ;
  resultPage;
  lastQuery = '';
  // spouseInput: string;
  relativeInput: Array<string>;
  minDate = new Date(1850, 0, 1);
  maxDate = new Date(1907, 11, 31);
  townList = ['Adana',
    'Adapazarı',
    'Amasya',
    'Ankara',
    'Asithane/Üsküdar',
    'Beyrut',
    'Bitlis',
    'Canik',
    'Dersaadet',
    'Diyarbakır',
    'Edirne',
    'Erzincan',
    'Erzurum',
    'Giresun',
    'Halep',
    'Karahisar',
    'Kayseri',
    'Malatya',
    'Mamuratülaziz',
    'Maraş',
    'Merzifon',
    'Muş',
    'Samsun',
    'Sivas',
    'Tokad',
    'Van',
    'Yozgad',
    'Çorum',
    'İzmiR'];
  constructor(public storage: StorageService, public knoraService: KnoraService, public helpers: Helpers, public router: Router) { }
  addRelative() {
    this.relativeInput.push('');
  }
  removeRelative(id: number) {
    this.relativeInput.splice(id, 1);
  }
  trackByFn(index: any, item: any) {
    return index;
  }
  fireSearch() {
    let townFilter = this.townInput;
    const townStrings = {
      Adana: 'Adana|Adana ',
      Ankara: 'Ankara|Ankara-Kayseri|Ankara-Kayseriye|Ankara-Yozgad',
      Bitlis: 'Bitlis|Bitlis |Bitlis-Muş',
      Edirne: 'Edirne|Edirne ',
      Erzincan: 'Erzincan|Eerzincan|Erzurum-Erzincan',
      Erzurum: 'Erzurum|Erzurum |Erzurum-Erzincan',
      Halep: 'Halep|Haleb|Halep-Maraş',
      Karahisar: 'Karahisar|Karahisar-ı  Şarki[Şebinkarahisar]|Karahisar-ı Şarki|Karahisar-ı Şarki[ Şebinkarahisar]|Karahisar-ı şarki|Karahisar-ı şarki[ Şebinkarahisar]',
      Kayseri: 'Kayseri|Kayseriye|Kayseriye |Kayseriyye',
      'Mamuratülaziz': 'Mamuratülaziz|Mamuretülaziz|Mamüratülazi|Mamüratülaziz|Mamüratülaziz |Mamüratülaziz-Dersim|Mamüretülaziz',
      Merzifon: 'Merfizon|Merzifon|Merzifon |Merzifon,Amasya',
      Sivas: 'Sivas|Sivas |Sivas-Amasya|Sivas-Karahisar-ı Şarki|Sivas-Şark-i Karaağaç Sancağı|Sivas-Şark-i Karaağaç sancağı',
      Tokad: 'Tokad|Tokat'
    };
    if (townStrings[townFilter]) {
      townFilter = townStrings[townFilter];
    }
    let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\n' +
      'PREFIX pou: <http://api.pou.test.dasch.swiss/ontology/0827/pou/v2#>\n' +
      'PREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\n' +
      'CONSTRUCT {\n' +
      '?person knora-api:isMainResource true .\n' +
      '?person pou:nameOfPerson ?nameObj .\n' +
      '?nameObj pou:text ?name .\n' +
      '?person pou:lastName ?lastName .\n' +
      '?person pou:turkishName ?turkishName .\n' +
      '?person pou:originTown ?originTown .\n' +
      '?person pou:fathersName ?fathersName .\n' +
      '} WHERE {\n' +
      '?person a knora-api:Resource .\n' +
      '?person a pou:Person .\n';
    if (this.nameInput === '') {
      query += 'OPTIONAL {\n' +
        '?person pou:nameOfPerson ?nameObj .\n' +
        '?nameObj pou:text ?name .\n' +
        '}\n';
    } else {
      query += '?person pou:nameOfPerson ?nameObj .\n' +
        '?nameObj pou:text ?name .\n' +
        '?name knora-api:valueAsString ?nameStr .\n' +
        'FILTER(regex(?nameStr, "' + this.nameInput + '", "i")).\n';
    }
    if (this.lastNameInput === '') {
      query += 'OPTIONAL {?person pou:lastName ?lastName .}\n' +
        'OPTIONAL {?person pou:turkishName ?turkishName .}\n';
    } else {
      query += '{\n' +
        '?person pou:lastName ?lastName .\n' +
        '?lastName knora-api:valueAsString ?lastNameStr .\n' +
        'FILTER(regex(?lastNameStr, "' + this.lastNameInput + '", "i")) .\n' +
        '}\n' +
        'UNION {\n' +
        '?person pou:turkishName ?turkishName .\n' +
        '?turkishName knora-api:valueAsString ?turkishNameStr .\n' +
        'FILTER(regex(?turkishNameStr, "' + this.lastNameInput + '", "i")) .\n' +
        '}\n';
    }
    if (this.fathersNameInput === '') {
      // TODO: Expand with Filters via relationships
      query += 'OPTIONAL {?person pou:fathersName ?fathersName .}\n';
    } else {
      query += '?person pou:fathersName ?fathersName .\n' +
        '?fathersName knora-api:valueAsString ?fathersNameStr .\n' +
        'FILTER(regex(?fathersNameStr, "' + this.fathersNameInput + '", "i")) .\n';
    }
    if (townFilter === '') {
      query += 'OPTIONAL {?person pou:originTown ?originTown .}\n';
    } else {
      query += '?person pou:originTown ?originTown .\n' +
        '?originTown knora-api:valueAsString ?originTownStr .\n' +
        'FILTER(regex(?originTownStr, "' + this.townInput + '", "i")) .\n';
    }
    if (this.arrivalInput !== -1) {
      const filterString = 'FILTER (knora-api:toSimpleDate(PROP) <= "GREGORIAN:' + (this.arrivalInput + Number(this.precisionInput)).toString() + '-12-31"^^knora-api-simple:Date && knora-api:toSimpleDate(PROP) > "GREGORIAN:' + (this.arrivalInput - Number(this.precisionInput) - 1).toString() + '-12-31"^^knora-api-simple:Date) .';
      const datePropsPerson = ['dateHRFile'];
      for (const prop of datePropsPerson) {
        query += '{\n' +
          '?person pou:' + prop + ' ?' + prop + ' .\n' +
          filterString.replace(/PROP/g, '?' + prop) +
          '\n}\n' +
          'UNION '; // no \n as it is continued by the next loop.
      }
      const sourcedDateProps = ['dateOfAdmission', 'dateOfArrival'];
      for (const prop of sourcedDateProps) {
        query += '{\n' +
          '?person pou:' + prop + ' ?' + prop + ' .\n' +
          '?' + prop + ' pou:dateValue ?' + prop + 'Val .\n' +
        filterString.replace(/PROP/g, '?' + prop + 'Val') + '\n}\n';
        query += 'UNION \n';
      }
      const datePropsPhysCop = ['dateOfDocument', 'dateOfPhotograph', 'dateOnPhotograph'];
      for (const prop of datePropsPhysCop) {
        query += '{\n' +
          '?photo pou:peopleOnPic ?person .\n' +
          '?photo pou:physicalCopy ?physicalCopy .' +
          '?physicalCopy pou:' + prop + ' ?' + prop + ' .\n' +
          filterString.replace(/PROP/g, '?' + prop) +
          '\n}\n' +
          'UNION '; // no \n as it is continued by the next loop.
      }
      query += '{\n' +
        '?photo pou:peopleOnPic ?person .\n' +
        '?photo pou:dateOfPassport ?dateOfPassport .\n' +
        filterString.replace(/PROP/g, '?dateOfPassport') + '\n}\n';
      query += 'UNION {\n' +
        '?photo pou:peopleOnPic ?person .\n' +
        '?coverLetter pou:photograph ?photo .\n' +
        '?coverLetter pou:dateOfCoverLetter ?dateOfCoverLetter .\n' +
        filterString.replace(/PROP/g, '?dateOfCoverLetter') + '\n}\n';
    }
    /* if (this.spouseInput !== '') {
      const spouseRelationships = [
        ['Self', 'Intended'],
        ['Self, Husband'],
        ['Self, Wife'],
        ['Self', 'Spouse'],
        ['Self', 'Fiancee'],
        ['Grandmother', 'Grandfather'],
        ['Father', 'Stepmother'],
        ['Motherinlaw', 'Fatherinlaw'],
        ['Father', 'Mother'],
        ['Brotherswife', 'Brother']
      ];
    }*/
    if (this.relativeInput.length > 1 || this.relativeInput[0] !== '') {
      for (let i = 0; i < this.relativeInput.length ; i++) {
        const name = this.relativeInput[i];
        if (name !== '') {
          query += '?photo pou:peopleOnPic ?person .\n' +
            '?photo pou:peopleOnPic ?relative' + i.toString() + ' .\n' +
            '?relative' + i.toString() + ' pou:nameOfPerson ?relNameObj' + i.toString() + ' .\n' +
            '?relNameObj' + i.toString() + ' pou:text ?relName' + i.toString() + ' .\n' +
            '?relName' + i.toString() + ' knora-api:valueAsString ?relNameStr' + i.toString() + ' .\n' +
            'FILTER( regex(?relNameStr' + i.toString() + ', "' + name + '", "i")) .\n';
        }
      }
    }
    query += '}';
    this.fireQuery(query);
  }
  fireQuery(query: string) {
    this.results = [];
    this.lastQuery = query;
    this.knoraService.gravsearchQueryByStringCount(query).subscribe(
      (no: number) => {
        this.countRes = no;
      }
    );
    query += '\nOFFSET ' + this.resultPage.toString();
    this.knoraService.gravsearchQueryByString(query).subscribe(
      (readResources: ReadResource[]) => {
        const turkishNameProp = this.knoraService.pouOntology + 'turkishName';
        const lastNameProp = this.knoraService.pouOntology + 'lastName';
        const fathersNameProp = this.knoraService.pouOntology + 'fathersName';
        const originTownProp = this.knoraService.pouOntology + 'originTown';
        const nameProp = this.knoraService.pouOntology + 'nameOfPersonValue';
        const textProp = this.knoraService.pouOntology + 'text';
        for (const readResource of readResources) {
          const iri = readResource.id;
          console.log(iri);
          let names = [];
          let lastNames = [];
          let fathersNames = [];
          let towns = [];
          const nameObjects = this.helpers.getLinkedReadResources(readResource, nameProp);
          for (const name of nameObjects) {
            names = names.concat(name.getValuesAsStringArray(textProp));
          }
          lastNames = lastNames.concat(readResource.getValuesAsStringArray(lastNameProp))
            .concat(readResource.getValuesAsStringArray(turkishNameProp));
          fathersNames = fathersNames.concat(readResource.getValuesAsStringArray(fathersNameProp));
          towns = towns.concat(readResource.getValuesAsStringArray(originTownProp));
          this.results.push(new Result(iri, names, lastNames, towns, fathersNames));
        }
        console.log(this.results);
      }
    );
  }

  getString(arr: string[]) {
    let str = '';
    for (const s of arr) {
      str += s + ', ';
    }
    str = str.slice(0, -2);
    return str;
  }
  changePage(increment: number) {
    if (this.resultPage + increment >= 0 && this.resultPage + increment < this.countRes / 25) {
      this.resultPage += increment;
      this.fireQuery(this.lastQuery);
    }

  }
  resultClicked(targetIri: string): void {
    const url: string = 'details/' + encodeURIComponent(targetIri);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
        console.log("Navigation is successful!");
      } else {
        console.log("Navigation has failed!");
      }
    });
  }

  ngOnInit() {
    this.nameInput = this.storage.simpleNameInput;
    this.lastNameInput = this.storage.simpleLastNameInput;
    this.fathersNameInput = this.storage.simpleFathersNameInput;
    this.townInput = this.storage.simpleTownInput;
    this.arrivalInput = this.storage.simpleArrivalInput;
    this.precisionInput = this.storage.simplePrecisionInput;
    // this.spouseInput = this.storage.simpleSpouseInput;
    this.relativeInput = this.storage.simpleRelativeInput;
    this.resultPage = this.storage.simplePage;
    if (this.nameInput !== '' || this.lastNameInput !== '' || this.fathersNameInput !== '' || this.townInput !== '' || this.arrivalInput !== -1 ||  this.precisionInput !== '0' || this.relativeInput.length > 1 || this.relativeInput[0] !== '') {
      this.fireSearch();
    }
  }
  ngOnDestroy() {
    this.storage.simpleNameInput = this.nameInput;
    this.storage.simpleLastNameInput = this.lastNameInput;
    this.storage.simpleFathersNameInput = this.fathersNameInput;
    this.storage.simpleTownInput = this.townInput;
    this.storage.simpleArrivalInput = this.arrivalInput;
    this.storage.simplePrecisionInput = this.precisionInput;
    // this.storage.simpleSpouseInput = this.spouseInput;
    this.storage.simpleRelativeInput = this.relativeInput;
    this.storage.simplePage = this.resultPage;
  }

}
