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
  MatAutocompleteModule
} from '@angular/material';

import {SparqlPrep} from './classes/sparql-prep';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';

export function initializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.Init();
  };
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent
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
    MatAutocompleteModule
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppInitService], multi: true
    },
    SparqlPrep,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
