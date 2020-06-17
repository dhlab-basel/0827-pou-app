import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  propertyFields: number = 5;
  arr: number[];
  selectedResourceType: string;
  personProps: { 'prop': string, 'type': string }[] = [{prop: 'name', type: 'string'} , {prop: 'gender', type: 'list'}];
  photoProps: { 'prop': string, 'type': string }[] = [{prop: 'physCop', type: 'object'}, {prop: 'id', type: 'number'}];
  physCopProps: { 'prop': string, 'type': string }[] = [{prop: 'iri', type: 'string'}, {prop: 'image', type: 'image'}];
  coverLetterProps: { 'prop': string, 'type': string }[] = [{prop: 'date', type: 'date'}, {prop: 'author', type: 'string'}];
  constructor() {
    this.arr = Array(this.propertyFields).fill(0).map((x, i) => i);
  }

  ngOnInit() {
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

}
