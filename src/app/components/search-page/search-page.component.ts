import { Component, OnInit } from '@angular/core';
import {KnoraService} from '../../services/knora.service';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  arr: number[];
  propertiesChosen: string[];
  valuesChosen: string[];
  selectedResourceType: string;
  personProps: { 'prop': string, 'type': string }[] = [];
  photoProps: { 'prop': string, 'type': string }[] = [];
  physCopProps: { 'prop': string, 'type': string }[] = [];
  coverLetterProps: { 'prop': string, 'type': string }[] = [];
  personFileProps: { 'prop': string, 'type': string }[] = [];
  sourcedDateProps: { 'prop': string, 'type': string }[] = [];
  sourcedTextProps: { 'prop': string, 'type': string }[] = [];
  relPhotosProps: { 'prop': string, 'type': string }[] = [];
  documentProps: { 'prop': string, 'type': string }[] = [];
  backOfImageProps: { 'prop': string, 'type': string }[] = [];

  constructor(private knoraService: KnoraService) {
    this.arr = Array(1).fill(0).map((x, i) => i);
    this.propertiesChosen = Array(1).fill('');
    this.valuesChosen = Array(1).fill('');
  }

  ngOnInit() {
    this.getOnto();
  }
  getOnto() {
    const onto = this.knoraService.getOntology(this.knoraService.pouOntology.slice(0, -1));
    onto.subscribe( ontoValue => {
      for (const key in ontoValue.properties) {
        const prop = ontoValue.properties[key];
        const objValue = prop.objectType.substring(prop.objectType.lastIndexOf('#') + 1, prop.objectType.length);
        if (objValue === 'LinkValue') {
          continue;
        }
        const subValue = prop.subjectType.substring(prop.subjectType.lastIndexOf('#') + 1, prop.subjectType.length);
        switch (subValue) {
          case 'PersonFile':
            this.personFileProps.push({prop: prop.label, type: objValue});
            break;
          case 'Person':
            this.personProps.push({prop: prop.label, type: objValue});
            break;
          case 'CoverLetter':
            this.coverLetterProps.push({prop: prop.label, type: objValue});
            break;
          case 'Photograph':
            this.photoProps.push({prop: prop.label, type: objValue});
            break;
          case 'PhysicalCopy':
            this.physCopProps.push({prop: prop.label, type: objValue});
            break;
          case 'SourcedDate':
            this.sourcedDateProps.push({prop: prop.label, type: objValue});
            break;
          case 'SourcedText':
            this.sourcedTextProps.push({prop: prop.label, type: objValue});
            break;
          case 'RelatedPhotographs':
            this.relPhotosProps.push({prop: prop.label, type: objValue});
            break;
          case 'BackOfImage':
            this.backOfImageProps.push({prop: prop.label, type: objValue});
            break;
          case 'Document':
            this.documentProps.push({prop: prop.label, type: objValue});
            break;
          default:
            console.log('Couldnt find: ', subValue);

        }
      }
    });
  }
  getProps(): { 'prop': string, 'type': string }[] {
    switch (this.selectedResourceType) {
      case 'physCop': {
        return this.physCopProps;
      }
      case 'photo': {
        return this.photoProps;
      }
      case 'person': {
        return this.personProps;
      }
      case 'coverLetter': {
        return this.coverLetterProps;
      }
      default: {
        return [];
      }
    }
  }
  addProperty() {
    this.arr = Array(this.arr.length + 1).fill(0).map((x, i) => i);
    this.propertiesChosen.push('');
    this.valuesChosen.push('');
    console.log(this.propertiesChosen);
    console.log(this.valuesChosen);
  }
  removeProperty(no: number) {
    console.log('called with', no);
    if (this.arr.length === 0) {
      return;
    }
    this.propertiesChosen.splice(no, 1);
    this.valuesChosen.splice(no, 1);
    this.arr.pop();
    console.log(this.arr);
  }

}
