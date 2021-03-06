import {Component, OnDestroy, OnInit} from '@angular/core';
import {KnoraService} from '../../services/knora.service';
import {MatDatepicker, MatDatepickerInputEvent} from '@angular/material/datepicker';
import {SparqlPrep} from '../../classes/sparql-prep';
import {AppInitService} from '../../app-init.service';
import {ReadDateValue, ReadLinkValue, ReadResource, ReadTextValueAsString, ReadValue, ResourcePropertyDefinition} from '@knora/api';
import {Router} from '@angular/router';
import {StorageService} from '../../services/storage.service';

/**
 * Class to store knora list nodes with their iri and label.
 */
class PouListNode {
  constructor(public iri: string, public label: string) {
  }
}

class Property {
  constructor(public prop: string, public type: string, public originalName: string, public listiri?: string) {
  }
}

class SearchResult {
  constructor(public targetIri: string, public results: Array<Array<string>>) {
  }
}

class PropertyValuePair {
  constructor(public prop: Property, public value: valueType) {
  }
}

class KnoraDate {
  constructor(public dateBefore: string, public dateAfter: string) {
  }
}

type possibleValues = (string | boolean | KnoraDate | PouListNode);
type valueType = (possibleValues | PropertyValuePair);

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {
  showProgbar: boolean = false;
  resultPage: number = 0;
  lastQuery: string;
  arr: number[];
  propertiesChosen: Property[];
  valuesChosen: valueType[];
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
  formQueryString: string;
  gravQueryFieldText = '';
  lists: { [index: string]: Array<PouListNode> } = {};
  minDate: Date;
  maxDate: Date;
  resWarning = false;

  searchResults: Array<SearchResult>;
  columnsToDisplay: Array<string> = ['0', '1', '2'];

  constructor(private appInitService: AppInitService,
              private knoraService: KnoraService,
              private sparqlPrep: SparqlPrep,
              private router: Router,
              public storage: StorageService) {
    this.arr = Array(1).fill(0).map((x, i) => i);
    this.propertiesChosen = Array(1).fill(new Property('', '', ''));
    this.valuesChosen = Array(1).fill('');
    this.operatorsChosen = Array(1).fill('exists');
    this.minDate = new Date(1850, 1, 1);
    this.maxDate = new Date(1907, 11, 31);
  }

  ngOnInit() {
    if (!this.knoraService.loggedin) {
      this.router.navigateByUrl('/login');
    }
    this.getOnto();
    // this.loadFromStorage();
  }

  loadFromStorage() {
    console.log(this.storage);
    this.lastQuery = this.storage.searchPageQuery;
    this.resultPage = this.storage.searchPageOffset;
    this.propertiesChosen = this.storage.searchPagePropsChosen;
    this.valuesChosen = this.storage.searchPageValsChosen;
    this.operatorsChosen = this.storage.searchPageOpsChosen;
    this.selectedResourceType = this.storage.searchPageSelectedResType;
    this.onlyCount = this.storage.searchPageOnlyCount;
    this.gravQueryFieldText = this.storage.searchPageGravField;
    console.log(this.arr);
    this.createFormQuery();
    if (this.lastQuery !== '') {
      this.fire(this.lastQuery);
    }
  }

  getOnto() {
    const onto = this.knoraService.getOntology(this.knoraService.pouOntology.slice(0, -1));
    onto.subscribe(ontoValue => {
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

  logEverything() {
    console.log('Properties Chosen: ', this.propertiesChosen);
    console.log('Values Chosen: ', this.valuesChosen);
  }

  changeProp(index: number, value: Property) {
    this.propertiesChosen[index] = value;
    this.valuesChosen[index] = '';
  }

  addProperty() {
    this.arr = Array(this.arr.length + 1).fill(0).map((x, i) => i);
    this.propertiesChosen.push(new Property('', '', ''));
    this.valuesChosen.push('');
    this.operatorsChosen.push('exists');
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

  deleteAllProps() {
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

  dateValueChanged(index: number, depth: string, event: MatDatepickerInputEvent<unknown>) {
    console.log(event.value);
    const value: Date = event.value as Date;
    const bounds = this.getBoundsForDate(value, depth);
    this.valuesChosen[index] = new KnoraDate(bounds[0], bounds[1]);
  }

  dateValueChangeOnLinkedRes(id: number, level: number, dateDepth: string, event: MatDatepickerInputEvent<unknown>) {
    const value: Date = event.value as Date;
    const bounds = this.getBoundsForDate(value, dateDepth);
    const valstr = new KnoraDate(bounds[0], bounds[1]);
    this.changeValueOfLinkedRes(id, level, valstr);
  }

  getBoundsForDate(value: Date, depth: string): Array<string> {
    const toReturn: Array<string> = [];
    const dateBeforeAsDate = new Date(value.getTime());
    dateBeforeAsDate.setDate(value.getDate() - 1);
    const dateBefore = 'GREGORIAN:' + dateBeforeAsDate.getFullYear().toString() + '-' + (dateBeforeAsDate.getMonth() + 1).toString() + '-' + dateBeforeAsDate.getDate().toString();
    let dateAfter = '';
    if (depth === 'year') {
      dateAfter = 'GREGORIAN:' + (value.getFullYear()).toString() + '-12-31';
    }
    if (depth === 'month') {
      const dateConst = new Date(value.getFullYear(), value.getMonth() + 1, 0); // set to last date of month
      dateAfter = 'GREGORIAN:' + (dateConst.getFullYear()).toString() + '-' + (dateConst.getMonth() + 1).toString() + '-' + dateConst.getDate().toString();
    }
    toReturn.push(dateBefore);
    toReturn.push(dateAfter);
    return toReturn;
  }

  createFormQuery() {
    /*let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>\n';
    query += 'PREFIX pou: <{{ ontology }}/ontology/0827/pou/simple/v2#>\n';
    query += 'CONSTRUCT {\n?mainres knora-api:isMainResource true .\n';*/
    let query = '';
    for (let i = 0; i < this.propertiesChosen.length; i++) {
      const property = this.propertiesChosen[i];
      const value = this.valuesChosen[i];
      query += ('?mainres pou:' + property.originalName + ' ?' + property.originalName + ' .\n');
      if (value instanceof PropertyValuePair) {
        let curr: valueType = value;
        let currProp = property;
        while (curr instanceof PropertyValuePair) {
          curr = curr as PropertyValuePair;
          query += ('?' + currProp.originalName + ' pou:' + curr.prop.originalName + ' ?' + curr.prop.originalName + ' .\n');
          const tmp = curr;
          curr = curr.value;
          currProp = tmp.prop;
        }
        if (curr !== '') {
          query += this.getFilterString(curr, currProp.originalName);
        }
      } else {
        if (value !== '') {
          query += this.getFilterString(value, property.originalName);
        }
      }
    }
    /*query += '} WHERE {\n?mainres a knora-api:Resource .\n?mainres a pou:' + this.selectedResourceType + ' .\n';
    // TODO: Add code to filter for values given here if equals.
    for (const property of this.propertiesChosen) {
      query += ('?mainres pou:' + property.originalName + ' ?' + property.originalName + ' .\n');
    }
    query += '}';

    const params = {ontology: this.appInitService.getSettings().ontologyPrefix };
    const querystring = this.sparqlPrep.compile(query, params);
    console.log(querystring);
    this.fire(querystring);

     */
    this.formQueryString = query;
  }

  getFilterString(value: possibleValues, propOrigName: string) {
    if (typeof value === 'string') {
      return '?' + propOrigName + ' knora-api:valueAsString ?' + propOrigName + 'Str .\n' + 'FILTER regex(?' + propOrigName + 'Str, "' + value + '", "i") .\n';
    }
    if (typeof value === 'boolean') {
      return '?' + propOrigName + ' knora-api:booleanValueAsBoolean ?' + propOrigName + 'Bool .\n' + 'FILTER (?' + propOrigName + 'Bool = ' + value + ') .\n';

    }
    if (value instanceof KnoraDate) {
      return 'FILTER (knora-api:toSimpleDate(?' + propOrigName + ') <= "' + value.dateAfter + '"^^knora-api-simple:Date && knora-api:toSimpleDate(?' + propOrigName + ') > "' + value.dateBefore + '"^^knora-api-simple:Date) .\n';
    }
    if (value instanceof PouListNode) {
      return '?' + propOrigName + ' knora-api:listValueAsListNode <' + value.iri + '> .';
    }
  }

  createGravfieldQuery(enteredString: string) {
    this.resultPage = 0;
    if (this.formQueryString) {
      enteredString = this.formQueryString + enteredString;
    }
    const params = {ontology: this.appInitService.getSettings().ontologyPrefix};
    let query = 'PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>\nPREFIX pou: <{{ ontology }}/ontology/0827/pou/v2#>\nPREFIX knora-api-simple: <http://api.knora.org/ontology/knora-api/simple/v2#>\nCONSTRUCT {\n';
    if (enteredString === '') {
      query += '?mainres knora-api:isMainResource true .} WHERE {\n ?mainres a knora-api:Resource .\n?mainres a pou:' + this.selectedResourceType + ' .}';
    } else {
      const mainres = enteredString.substring(0, enteredString.indexOf(' '));
      const lines = enteredString.split('\n');
      query += mainres + ' knora-api:isMainResource true .';
      for (let line of lines) {
        console.log(line);
        if (line.startsWith('FILTER')) {
          console.log('Detected FILTER');
          continue;
        }
        if (line.indexOf('knora-api:valueAsString') !== -1 || line.indexOf('knora-api:booleanValueAsBoolean') !== -1) {
          console.log('Detected forbidden string');
          continue;
        }
        const arr = line.split(' ');
        if (arr.length === 4) {
          if (!(arr[2].startsWith('?'))) { // found listnode filter
            continue;
          }
          if (arr[1].indexOf(':') === -1) { //pou: missing
            line = arr[0] + ' pou:' + arr[1] + ' ' + arr[2] + ' ' + arr[3];
          }
        }
        query += '\n' + line;
      }
      query += '} WHERE {\n' + mainres + ' a knora-api:Resource .\n' + mainres + ' a pou:' + this.selectedResourceType + ' .';
      for (let line of lines) {
        const arr = line.split(' ');
        if (arr.length === 4) {
          if (arr[1].indexOf(':') === -1) { //pou: missing
            line = arr[0] + ' pou:' + arr[1] + ' ' + arr[2] + ' ' + arr[3];
          }
        }
        query += '\n' + line;
      }
      query += '}';
    }
    const querystring = this.sparqlPrep.compile(query, params);
    this.lastQuery = querystring;
    console.log(querystring);
    this.fire(querystring);
  }
  searchClicked(enteredString: string) {
    if (!this.selectedResourceType) {
      this.resWarning = true;
    } else {
      this.createGravfieldQuery(enteredString);
    }
  }
  fire(querystring) {
    this.resWarning = false;
    this.showProgbar = true;
    this.knoraService.gravsearchQueryByStringCount(querystring).subscribe(
      (no: number) => {
        this.countRes = no;
      }
    );
    if (this.onlyCount) {
      return;
    }
    querystring += '\n OFFSET ' + String(this.resultPage);
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
        this.showProgbar = false;
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
    const url: string = 'details/' + encodeURIComponent(targetIri);
    this.router.navigateByUrl(url).then(e => {
      if (e) {
        console.log('Navigation is successful!');
      } else {
        console.log('Navigation has failed!');
      }
    });
  }

  changePropOfLinkedRes(id: number, level: number, property: Property) {
    if (level === 1) {
      this.valuesChosen[id] = new PropertyValuePair(property, '');
      return;
    }
    this.changeValueOfLinkedRes(id, level - 1, new PropertyValuePair(property, ''));
  }

  changeValueOfLinkedRes(id: number, level: number, value: valueType) {
    if (level === 0) {
      this.valuesChosen[id] = value;
      return;
    }
    let i = 1;
    let curr = this.valuesChosen[id] as valueType;
    while (i < level) {
      if (!(curr instanceof PropertyValuePair)) {
        this.changeValueOfLinkedRes(id, i, this.createEmptyPropValFromLevelWithValue(level - i, value));
        return;
      }
      curr = curr as PropertyValuePair;
      curr = curr.value;
      i++;
    }
    if (!(curr instanceof PropertyValuePair)) {
      curr = new PropertyValuePair(new Property('', '', ''), value);
    }
    curr = curr as PropertyValuePair;
    curr.value = value;
    this.changeValueOfLinkedRes(id, level - 1, curr);
  }

  pageChanged(event: any) {
    if (!this.lastQuery) {
      return;
    }
    this.resultPage = event.pageIndex;
    this.fire(this.lastQuery);
  }

  createEmptyPropValFromLevelWithValue(levels: number, value: valueType): PropertyValuePair {
    let toReturn: PropertyValuePair = new PropertyValuePair(new Property('', '', ''), value);
    while (levels > 0) {
      toReturn = new PropertyValuePair(new Property('', '', ''), toReturn);
      levels--;
    }
    return toReturn;
  }

  yearSelected(elem: MatDatepicker<any>, event: Date) {
    console.log(event);
    elem.close();
    elem.select(event);
  }

  monthSelected(elem: MatDatepicker<any>, event: Date) {
    console.log(event);
    elem.close();
    elem.select(event);
  }

  ngOnDestroy() {
    this.storage.searchPageQuery = this.lastQuery;
    this.storage.searchPageOffset = this.resultPage;
    this.storage.searchPagePropsChosen = this.propertiesChosen;
    this.storage.searchPageValsChosen = this.valuesChosen;
    this.storage.searchPageOpsChosen = this.operatorsChosen;
    this.storage.searchPageSelectedResType = this.selectedResourceType;
    this.storage.searchPageOnlyCount = this.onlyCount;
    this.storage.searchPageGravField = this.gravQueryFieldText;
  }
}
