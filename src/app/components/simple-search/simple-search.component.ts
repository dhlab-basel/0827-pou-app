import {Component, OnDestroy, OnInit} from '@angular/core';
import {StorageService} from '../../services/storage.service';

@Component({
  selector: 'app-simple-search',
  templateUrl: './simple-search.component.html',
  styleUrls: ['./simple-search.component.scss']
})
export class SimpleSearchComponent implements OnInit, OnDestroy {
  nameInput: string;
  fathersNameInput: string;
  townInput: string;
  arrivalInput: number;
  precisionInput: string;
  spouseInput: string;
  childrenInput: Array<string>;
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
  constructor(public storage: StorageService) { }
  addChild() {
    this.childrenInput.push('');
  }
  removeChild(id: number) {
    this.childrenInput.splice(id, 1);
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
    console.log('NAME: ', this.nameInput);
    console.log('FATHERS NAME', this.fathersNameInput);
    console.log('TOWN: ', townFilter);
    console.log('ARRIVAL: ', this.arrivalInput);
    console.log('PRECISION: ', this.precisionInput);
    console.log('SPOUSE: ', this.spouseInput);
    console.log('CHILDREN: ', this.childrenInput);
  }
  ngOnInit() {
    this.nameInput = this.storage.simpleNameInput;
    this.fathersNameInput = this.storage.simpleFathersNameInput;
    this.townInput = this.storage.simpleTownInput;
    this.arrivalInput = this.storage.simpleArrivalInput;
    this.precisionInput = this.storage.simplePrecisionInput;
    this.spouseInput = this.storage.simpleSpouseInput;
    this.childrenInput = this.storage.simpleChildrenInput;
    if (this.nameInput !== '' || this.fathersNameInput !== '' || this.townInput !== '' || this.arrivalInput !== -1 ||  this.precisionInput !== '' || this.spouseInput !== '' || this.childrenInput.length !== 1 || this.childrenInput[0] !== '') {
      this.fireSearch();
    }
  }
  ngOnDestroy() {
    this.storage.simpleNameInput = this.nameInput;
    this.storage.simpleFathersNameInput = this.fathersNameInput;
    this.storage.simpleTownInput = this.townInput;
    this.storage.simpleArrivalInput = this.arrivalInput;
    this.storage.simplePrecisionInput = this.precisionInput;
    this.storage.simpleSpouseInput = this.spouseInput;
    this.storage.simpleChildrenInput = this.childrenInput;
  }

}
