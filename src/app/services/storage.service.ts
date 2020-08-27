import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  photowallFilters = {people: [], photographer: [], town: []};
  searchPageQuery = '';
  searchPageOffset = 0;
  searchPagePropsChosen = [];
  searchPageValsChosen = [];
  searchPageOpsChosen = [];
  searchPageSelectedResType = '';
  searchPageOnlyCount = false;
  searchPageGravField = '';
  simpleNameInput = '';
  simpleLastNameInput = '';
  simpleFathersNameInput = '';
  simpleTownInput = '';
  simpleArrivalInput = -1;
  simplePrecisionInput = '0';
  // simpleSpouseInput = '';
  simpleRelativeInput = [''];
  simplePage = 0;
  constructor() { }
}
