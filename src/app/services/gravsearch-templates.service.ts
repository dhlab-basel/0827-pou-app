import { Injectable } from '@angular/core';
import { SparqlPrep} from '../classes/sparql-prep';

@Injectable({
  providedIn: 'root'
})

export class GravsearchTemplatesService {

  constructor(private sparqlPrep: SparqlPrep) { }

  book_query(params: {[index: string]: string}): string {
    const result = this.sparqlPrep.compile(`
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX incunabula: <{{ ontology }}/ontology/0803/incunabula/simple/v2#>
    CONSTRUCT {
      ?book knora-api:isMainResource true .
      ?book incunabula:title ?title .
      ?book incunabula:pubdate ?pubdate .
    } WHERE {
      ?book a knora-api:Resource .
      ?book a incunabula:book .
      ?book incunabula:title ?title .
      FILTER regex(?title, "{{ book_title }}", "i") .
      OPTIONAL { ?book incunabula:pubdate ?pubdate . }
    }
    `, params);
    return result;
  }
}
