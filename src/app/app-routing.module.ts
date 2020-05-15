import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent} from './components/home/home.component';
import {PhotoPageComponent} from './components/photo-page/photo-page.component';
import {FamilyTreeComponent} from './components/family-tree/family-tree.component';


const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  }, {
    path: 'photo/:iri',
    component: PhotoPageComponent
  },
  {
    path: 'tree',
    component: FamilyTreeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
