import { Component, OnInit } from '@angular/core';
import {KnoraService} from '../../services/knora.service';
import {MatDatepickerInputEvent, MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material';
import {stringify} from 'querystring';
import {SparqlPrep} from '../../classes/sparql-prep';
import {AppInitService} from '../../app-init.service';
import {ReadDateValue, ReadLinkValue, ReadResource, ReadTextValueAsString, ReadValue, ResourcePropertyDefinition} from '@knora/api';
import {Router} from '@angular/router';

class PouListNode {
  constructor(public iri: string, public label: string) {}
}
class Property {
  constructor(public prop: string, public type: string, public originalName: string, public listiri?: string) {}
}
class SearchResult {
  constructor(public targetIri: string, public results: Array<Array<string>>) {}
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
  countRes: number;
  currentIdentifier = 'a1';
  gravQueryFieldText = '?a pou:peopleOnPic ?b .\n' +
    '?a pou:destination ?d .\n' +
    '?b pou:turkishName ?c .\n' +
    '?b pou:originTown ?t .';
  lists: {[index: string]: Array<PouListNode>} = {};


  searchResults: Array<SearchResult>;
  columnsToDisplay: Array<string> = ['0', '1', '2'];

  constructor(private appInitService: AppInitService,
              private knoraService: KnoraService,
              private sparqlPrep: SparqlPrep,
              private router: Router) {
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
      console.log('ONTOLOGY', ontoValue);
      for (const key in ontoValue.properties) {
        const prop = ontoValue.properties[key] as ResourcePropertyDefinition;
        const objValue = prop.objectType.substring(prop.objectType.lastIndexOf('#') + 1, prop.objectType.length);
        const origName = prop.id.substring(prop.id.lastIndexOf('#') + 1, prop.id.length);
        if (objValue === 'LinkValue') {
          continue;
        }
        let listIri: string;
        if (objValue === 'ListValue') {
          const tmp = prop.guiAttributes[0].split('=');
          listIri = tmp[1].slice(1, -1);
          if (this.lists[listIri] === undefined) {
            this.lists[listIri] = []; // empty list to prevent double loading! getList is asynchronous!!!
            this.knoraService.getList(listIri).subscribe(
              listResponse => {
                const listNodes: Array<PouListNode> = [];
                for (const listNode of listResponse.list.children) {
                  listNodes.push(new PouListNode(listNode.id, listNode.labels[0].value));
                }
                this.lists[listIri] = listNodes;
                console.log('========>', this.lists[listIri]);
              }
            );
          }
        }
        const subValue = prop.subjectType.substring(prop.subjectType.lastIndexOf('#') + 1, prop.subjectType.length);
        switch (subValue) {
          case 'PersonFile':
            this.personFileProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'Person':
            this.personProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'CoverLetter':
            this.coverLetterProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'Photograph':
            this.photoProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'PhysicalCopy':
            this.physCopProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'SourcedDate':
            this.sourcedDateProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'SourcedText':
            this.sourcedTextProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'RelatedPhotographs':
            this.relPhotosProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'BackOfImage':
            this.backOfImageProps.push(new Property(prop.label, objValue, origName, listIri));
            break;
          case 'Document':
            this.documentProps.push(new Property(prop.label, objValue, origName, listIri));
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
  getPropsOfResclass(resclass: string): Property[] {
    console.log('Called with:', resclass);
    switch (resclass) {
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
      case 'PersonFile': {
        return this.personFileProps;
      }
      case 'SourcedDate': {
        return this.sourcedDateProps;
      }
      case 'SourcedText': {
        return this.sourcedTextProps;
      }
      case 'RelatedPhotographs': {
        return this.relPhotosProps;
      }
      case 'Document': {
        return this.documentProps;
      }
      case 'BackOfImage': {
        return this.backOfImageProps;
      }
      default: {
        return [];
      }
    }
  }
  logEverything(){
    console.log('Properties Chosen: ', this.propertiesChosen);
    console.log('Values Chosen: ', this.valuesChosen);
  }
  changeProp(index: number, value: Property) {
    this.propertiesChosen[index] = value;
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
  deleteAllProps(){
    if (this.arr.length === 0) {
      return;
    }
    this.removeProperty(0);
    this.deleteAllProps();
  }

  /*changeProperty(index: number, value: string) {
    this.propertiesChosen[index].prop = value;
    for (const property of this.getProps()) {
      if (property.prop === value) {
        this.propertiesChosen[index].type = property.type;
        this.propertiesChosen[index].originalName = property.originalName;
      }
    }
  }*/

  dateValueChanged(index: number, event: MatDatepickerInputEvent<unknown>) {
    const value: Date = event.value as Date;
    this.valuesChosen[index] = value.getFullYear().toString() + '-' + (value.getMonth() + 1).toString() + '-' + value.getDate().toString();
  }

  createFormQuery() {
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

    const params = {ontology: this.appInitService.getSettings().ontologyPrefix };
    const querystring = this.sparqlPrep.compile(query, params);
    console.log(querystring);
    this.fire(querystring);
  }

/*
?a pou:peopleOnPic ?b .
?a pou:destination ?d .
?b pou:turkishName ?c .
 */
  createGravfieldQuery(enteredString: string) {
    const params = {ontology: this.appInitService.getSettings().ontologyPrefix};
    let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>\n';
    const mainres = enteredString.substring(0, enteredString.indexOf(' '));
    query += 'PREFIX pou: <{{ ontology }}/ontology/0827/pou/simple/v2#>\n';
    query += 'CONSTRUCT {\n' + mainres + ' knora-api:isMainResource true .\n';
    query += enteredString + '\n} WHERE {\n' + mainres + ' a knora-api:Resource .\n' + mainres + ' a pou:' + this.selectedResourceType + ' .\n' + enteredString + '}';
    const querystring = this.sparqlPrep.compile(query, params);
    console.log(querystring);
    this.fire(querystring);
  }
  fire(querystring) {
    if (this.onlyCount) {
      this.knoraService.gravsearchQueryByStringCount(querystring).subscribe(
        (no: number) => {
          this.countRes = no;
        }
      );
      return;
    }
    this.knoraService.gravsearchQueryByString(querystring).subscribe(
      (readResources: ReadResource[]) => {
        console.log('GAGA: (© by Lukas)', readResources);
        this.searchResults = [];
        this.columnsToDisplay = [];
        for (const readResource of readResources) {
          const results: Array<Array<string>> = [];
          results.push([readResource.label]);
          this.columnsToDisplay = [];
          for (const i in readResource.properties) {
            if (readResource.properties[i][0] instanceof ReadTextValueAsString) {
              const tmpArr = [];
              for (const gaga of readResource.properties[i]) {
                const data: ReadTextValueAsString = gaga as ReadTextValueAsString;
                tmpArr.push(data.strval);
              }
              results.push(tmpArr);
            } else if (readResource.properties[i][0] instanceof ReadLinkValue) {
              const tmpArr = [];
              for (const gaga of readResource.properties[i]) {

                const data: ReadLinkValue = gaga as ReadLinkValue;
                let str = '';
                const linkedRes: ReadResource = data.linkedResource;
                for (const k in linkedRes.properties) {
                  const gugus: Array<ReadValue> = linkedRes.properties[k];
                  for (const gugu of gugus) {
                    str += gugu.propertyLabel + ': ' + gugu.strval + ' ';
                  }
                }
                tmpArr.push(str);
              }
              results.push(tmpArr);
            } else if (readResource.properties[i][0] instanceof ReadDateValue) {
              const tmpArr = [];
              for (const gaga of readResource.properties[i]) {
                const data: ReadDateValue = gaga as ReadDateValue;
                tmpArr.push(data.strval);
              }
              results.push(tmpArr);
            } else {
              const tmpArr = [];
              for (const gaga of readResource.properties[i]) {
                const data: ReadValue = gaga as ReadValue;
                tmpArr.push(data.strval);
              }
              results.push(tmpArr);
            }
          }
          this.searchResults.push(new SearchResult(readResource.id, results));
        }
        // this.searchResults = new SearchResults('IRI', results);
        console.log('LABELS:', this.searchResults);
      }
    );
  }
  getListNodeByLabel(label: string): PouListNode {
    for (const id in this.lists) {
      for (const node of this.lists[id]) {
        if (node.label === label) {
          return node;
        }
      }
    }
  }

  resultClicked(targetIri: string): void {
    console.log('CLICKED: ', targetIri);
    console.log('RESTYPE:', this.selectedResourceType);
    const url: string = 'details/' + encodeURIComponent(targetIri);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
        console.log("Navigation is successful!");
      } else {
        console.log("Navigation has failed!");
      }
    });
  }
  getNextIdentifier() {
    const lastChar = this.currentIdentifier.substr(1);
    const num = Number(lastChar);
  }
}
