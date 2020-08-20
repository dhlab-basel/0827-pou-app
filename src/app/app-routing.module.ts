import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent} from './components/home/home.component';
import {PhotoPageComponent} from './components/photo-page/photo-page.component';
import {FamilyTreeComponent} from './components/family-tree/family-tree.component';
import {SearchPageComponent} from './components/search-page/search-page.component';
import {DetailsPageComponent} from './components/details-page/details-page.component';
import {SimpleSearchComponent} from './components/simple-search/simple-search.component';


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  }, {
    path: 'photo/:iri',
    component: PhotoPageComponent
  },
  {
    path: 'search',
    component: SearchPageComponent
  }, {
    path: 'details/:iri',
    component: DetailsPageComponent
  }, {
    path: 'simplesearch',
    component: SimpleSearchComponent
  },
  {
    path: '**',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
