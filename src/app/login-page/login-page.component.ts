import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {LoginComponent} from '../components/login/login.component';
import {KnoraService} from '../services/knora.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(public dialog: MatDialog,
              public knoraService: KnoraService,
              private router: Router) { }

  ngOnInit() {
  }
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
            /*this.logininfo = data.user;
            this.loggedin = true;*/
          }
        });
      });
  }

}
