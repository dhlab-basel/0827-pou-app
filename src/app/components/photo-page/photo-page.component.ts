import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-photo-page',
  template: `
    <p>
      photo-page works! {{ photoIri }}
    </p>
  `,
  styles: []
})
export class PhotoPageComponent implements OnInit {
  photoIri: string;

  constructor(public route: ActivatedRoute) { }

  gaga() {
    this.route.params.subscribe(params => {
      this.photoIri = params.iri;
    });
  }

  ngOnInit() {
    this.gaga();
  }

}
