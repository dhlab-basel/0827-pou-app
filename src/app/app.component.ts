import {Component, OnInit} from '@angular/core';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatButton } from "@angular/material/button";
import { LoginComponent, LoginData } from "./components/login/login.component";
import { KnoraService } from "./services/knora.service";
import { catchError } from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-root',
  providers: [],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'Portraits of Unbelonging';
  logininfo = '';
  loggedin = false;

  constructor(public dialog: MatDialog,
              public knoraService: KnoraService) {}

  private openLoginDialog(): void {
    const loginConfig = new MatDialogConfig();
    loginConfig.autoFocus = true;
    loginConfig.width = '500px';
    loginConfig.height = '600px';
    loginConfig.data = {
      email: 'gaga',
      password: ''
    };

    const dialogRef = this.dialog.open(LoginComponent, loginConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        this.knoraService.login(data.email, data.password).subscribe(data => {
          if (!data.success) {
            this.openLoginDialog();
          } else {
            this.logininfo = data.user;
            this.loggedin = true;
          }
        });
      });
  }

  private logout(): void {
    this.knoraService.logout().subscribe(data => {
      this.loggedin = false;
    });
  }

  account(): void {
    if (this.loggedin) {
      this.logout();
    } else {
      this.openLoginDialog();
    }
  }
}


/*
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {KnoraService} from './services/knora.service';
import {ReadResource, ReadValue} from '@knora/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit  {
  @ViewChild('searchTerm', {static: false})
  private searchTerm: ElementRef;
  title = 'test-app';

  searchres: Array<ReadResource> = [];

  resdata: ReadResource = new ReadResource();
  properties: Array<[string, string]> = [];

  constructor(public knoraService: KnoraService) { }

  getResource(iri: string) {
    this.knoraService.getResource(iri).subscribe((resdata: ReadResource) => {
      this.resdata = resdata;
      for (const name in resdata.properties) {
        if (resdata.properties.hasOwnProperty(name)) {
          this.properties.push([name, resdata.properties[name][0].strval]);
        }
      }
    });
  }

  searchEvent(): void {
    const params = {
      person_name: this.searchTerm.nativeElement.value
    };
    this.knoraService.gravsearchQuery('person_query', params).subscribe((searchres: Array<ReadResource>) => {
      console.log('RESDATA:: ', searchres);
      this.searchres = searchres;
    });
  }

  ngOnInit() {
    this.getResource('http://rdfh.ch/0803/0015627fe303');
  }

}
*/
