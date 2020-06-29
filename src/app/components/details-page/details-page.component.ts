import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {KnoraService} from '../../services/knora.service';

@Component({
  selector: 'app-details-page',
  templateUrl: './details-page.component.html',
  styleUrls: ['./details-page.component.scss']
})
export class DetailsPageComponent implements OnInit {
  iri: string;
  constructor(public route: ActivatedRoute,
              private knoraService: KnoraService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.iri = params.iri;
      this.knoraService.getResource(params.iri).subscribe(
        res => {
          console.log('=========>', res);
        }
      );
    });
  }

}
