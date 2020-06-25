import { Component, OnInit } from '@angular/core';
import {KnoraService} from '../../services/knora.service';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material';
import {stringify} from 'querystring';
import {SparqlPrep} from '../../classes/sparql-prep';

class Property {
  constructor(public prop: string, public type: string, public originalName: string) {}
}
@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
  arr: number[];
  propertiesChosen: Property[];
  valuesChosen: string[];
  operatorsChosen: string[];
  selectedResourceType: string;
  personProps: Property[] = [];
  photoProps: Property[] = [];
  physCopProps: Property[] = [];
  coverLetterProps: Property[] = [];
  personFileProps: Property[] = [];
  sourcedDateProps: Property[] = [];
  sourcedTextProps: Property[] = [];
  relPhotosProps: Property[] = [];
  documentProps: Property[] = [];
  backOfImageProps: Property[] = [];
  startDateForCalendars = new Date(1905, 1, 1);
  onlyCount: boolean = false;

  constructor(private knoraService: KnoraService, private sparqlPrep: SparqlPrep) {
    this.arr = Array(1).fill(0).map((x, i) => i);
    this.propertiesChosen = Array(1).fill(new Property('', '', ''));
    this.valuesChosen = Array(1).fill('');
    this.operatorsChosen = Array(1).fill('exists');
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
        const origName = prop.id.substring(prop.id.lastIndexOf('#') + 1, prop.id.length);
        if (objValue === 'LinkValue') {
          continue;
        }
        const subValue = prop.subjectType.substring(prop.subjectType.lastIndexOf('#') + 1, prop.subjectType.length);
        switch (subValue) {
          case 'PersonFile':
            this.personFileProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'Person':
            this.personProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'CoverLetter':
            this.coverLetterProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'Photograph':
            this.photoProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'PhysicalCopy':
            this.physCopProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'SourcedDate':
            this.sourcedDateProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'SourcedText':
            this.sourcedTextProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'RelatedPhotographs':
            this.relPhotosProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'BackOfImage':
            this.backOfImageProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          case 'Document':
            this.documentProps.push({prop: prop.label, type: objValue, originalName: origName});
            break;
          default:
            console.log('Couldnt find: ', subValue);

        }
      }
    });
  }
  getProps(): Property[] {
    switch (this.selectedResourceType) {
      case 'PhysicalCopy': {
        return this.physCopProps;
      }
      case 'Photograph': {
        return this.photoProps;
      }
      case 'Person': {
        return this.personProps;
      }
      case 'CoverLetter': {
        return this.coverLetterProps;
      }
      default: {
        return [];
      }
    }
  }
  addProperty() {
    this.arr = Array(this.arr.length + 1).fill(0).map((x, i) => i);
    this.propertiesChosen.push(new Property('', '', ''));
    this.valuesChosen.push('');
    this.operatorsChosen.push('exists');
    console.log(this.onlyCount);
  }
  removeProperty(no: number) {
    if (this.arr.length === 0) {
      return;
    }
    this.propertiesChosen.splice(no, 1);
    this.valuesChosen.splice(no, 1);
    this.operatorsChosen.splice(no, 1);
    this.arr.pop();
  }
  changeProperty(index: number, value: string) {
    this.propertiesChosen[index].prop = value;
    for (const property of this.getProps()) {
      if (property.prop === value) {
        this.propertiesChosen[index].type = property.type;
        this.propertiesChosen[index].originalName = property.originalName;
      }
    }
  }
  dateValueChanged(index: number, event: MatDatepickerInputEvent<unknown>) {
    const value: Date = event.value as Date;
    this.valuesChosen[index] = value.getFullYear().toString() + '-' + (value.getMonth() + 1).toString() + '-' + value.getDate().toString();
  }
  createQuery() {
    let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>\n';
    query += 'PREFIX pou: <{{ ontology }}/ontology/0827/pou/simple/v2#>\n';
    query += 'CONSTRUCT {\n?mainres knora-api:isMainResource true .\n';
    for (const property of this.propertiesChosen) {
      query += ('?mainres pou:' + property.originalName + ' ?' + property.originalName + ' .\n');
    }
    query += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a pou:' + this.selectedResourceType + ' .\n';
    // TODO: Add code to filter for values given here if equals.
    for (const property of this.propertiesChosen) {
      query += ('?mainres pou:' + property.originalName + ' ?' + property.originalName + ' .\n');
    }
    query += '}';

    console.log(query);
    const params = {};
    console.log(this.sparqlPrep.compile(query, params));
  }

}
