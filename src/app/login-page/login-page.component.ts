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
  images: string[] = ['BPwNmMl8WMR-EMNXi7mIxj1.jp2', 'KoFbGwVW4eg-GS2ZxciAt3u.jp2'];
  baseUrl: string = 'https://iiif.pou.test.dasch.swiss:443/0827';
  constructor(public dialog: MatDialog,
              public knoraService: KnoraService,
              private router: Router) { }

  ngOnInit() {
  }
  calcImageWidth(): number {
   return Math.floor(window.innerWidth / 4.5);
  }
  fire(email: string, password: string){
    this.knoraService.login(email, password).subscribe(data => {
      if (!data.success) {
        return; // TODO
      } else {
        this.router.navigateByUrl('/home');
      }
    });
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
