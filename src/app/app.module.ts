import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {AppInitService} from './app-init.service';
import {HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  MatButtonToggleModule,
  MatExpansionModule,
  MatGridListModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatDividerModule,
  MatTableModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatInputModule,
  MatFormFieldModule,
  MatMenuModule,
  MatDialogModule,
  MatFormFieldControl,
  MatSelectModule,
  MatTooltipModule,
  MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule, MatSlideToggleModule
} from '@angular/material';

import {SparqlPrep} from './classes/sparql-prep';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import {Helpers} from './classes/helpers';
import { PhotoPageComponent } from './components/photo-page/photo-page.component';
import { FamilyTreeComponent } from './components/family-tree/family-tree.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { DetailsPageComponent } from './components/details-page/details-page.component';
import { SimpleSearchComponent } from './components/simple-search/simple-search.component';

export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    PhotoPageComponent,
    FamilyTreeComponent,
    SearchPageComponent,
    DetailsPageComponent,
    SimpleSearchComponent
  ],
  entryComponents: [
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatTooltipModule,
    HttpClientModule,
    MatExpansionModule,
    MatGridListModule,
    MatGridListModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true
    },
    SparqlPrep,
    Helpers,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
