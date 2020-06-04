import { Injectable } from '@angular/core';
import { SparqlPrep} from '../classes/sparql-prep';

@Injectable({
  providedIn: 'root'
})

export class GravsearchTemplatesService {

  constructor(private sparqlPrep: SparqlPrep) { }

  person_query(params: {[index: string]: string}): string {
    const result = this.sparqlPrep.compile(`
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX pou: <{{ ontology }}/ontology/0827/pou/simple/v2#>
    CONSTRUCT {
      ?person knora-api:isMainResource true .
      ?person pou:LastName ?lastname .
      ?person pou:Photograph ?photograph .
    } WHERE {
      ?person a knora-api:Resource .
      ?person a pou:Person .
      ?person pou:LastName ?lastname .
      FILTER regex(?lastname, "{{ lastname }}", "i") .
      OPTIONAL { ?person pou:Photograph ?photograph . }
    }
    `, params);
    return result;
  }
  photos_query(params: {[index: string]: string}): string {
    const result = this.sparqlPrep.compile(`
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX pou: <{{ ontology }}/ontology/0827/pou/simple/v2#>
    CONSTRUCT {
        ?photograph knora-api:isMainResource true .
        ?photograph pou:physicalCopy ?physcop .
        ?photograph pou:anchorPerson ?anchorpers .
        ?photograph pou:peopleOnPic ?people .
        ?photograph pou:destination ?destination .
        ?physcop knora-api:hasStillImageFileValue ?imgfile .
        ?physcop pou:dateOfPhotograph ?photodate .
        ?physcop pou:fileName ?fileName .
        ?anchorpers pou:turkishName ?tname .
        ?people pou:turkishName ?tname2 .
        ?people pou:nameOfPerson ?firstNameObject .
        ?firstNameObject pou:text ?firstName .
        {{ #if photo_iri }}
        ?people pou:relationship ?relationship .
        {{ #endif }}
    } WHERE {
        {{ #if photo_iri }}
        BIND(<{{ photo_iri }}> AS ?photograph)
        ?people pou:relationship ?relationship .
        {{ #endif }}
        ?photograph a knora-api:Resource .
        ?photograph a pou:Photograph .
        ?photograph pou:physicalCopy ?physcop .
        ?physcop knora-api:hasStillImageFileValue ?imgfile .
        ?physcop pou:fileName ?fileName .
        OPTIONAL {
          ?photograph pou:anchorPerson ?anchorpers .
          ?anchorpers pou:turkishName ?tname .
        }
        OPTIONAL {
          ?photograph pou:peopleOnPic ?people .
          ?people pou:turkishName ?tname2 .
          ?people pou:nameOfPerson ?firstNameObject .
          ?firstNameObject pou:text ?firstName .
        }
        OPTIONAL { ?photograph pou:destination ?destination . }
        OPTIONAL { ?physcop pou:dateOfPhotograph ?photodate . }
    }
    OFFSET {{ page }}
    `, params);
    return result;
  }

  photos_query2(params: {[index: string]: string}): string {
    const result = this.sparqlPrep.compile(`
    PREFIX knora-api: <http://api.knora.org/ontology/knora-api/simple/v2#>
    PREFIX pou: <{{ ontology }}/ontology/0827/pou/simple/v2#>
    CONSTRUCT {
        ?photograph knora-api:isMainResource true .
        ?photograph pou:destination ?destination .
        ?photograph pou:physicalCopy ?physcop .
        ?physcop knora-api:hasStillImageFileValue ?imgfile .
        ?photograph pou:anchorPerson ?anchorpers .
        ?anchorpers pou:turkishName ?apname .
        ?anchorpers pou:nameOfPerson ?apFirstNameObject .
        ?apFirstNameObject pou:text ?firstName .
        ?photograph pou:peopleOnPic ?peopleOnPic .
        ?peopleOnPic pou:turkishName ?name .
        ?peopleOnPic pou:nameOfPerson ?firstNameObject .
        ?firstNameObject pou:text ?firstName .
        ?peopleOnPic pou:relToAnchorperson ?relationship .
        ?peopleOnPic pou:roi ?roi .
    } WHERE {
        {{ #if photo_iri }}
        BIND(<{{ photo_iri }}> AS ?photograph)
        {{ #endif }}
        ?photograph a knora-api:Resource .
        ?photograph a pou:Photograph .
        ?photograph pou:physicalCopy ?physcop .
        ?physcop knora-api:hasStillImageFileValue ?imgfile .
        OPTIONAL { ?photograph pou:destination ?destination . }
        OPTIONAL {
          ?photograph pou:anchorPerson ?anchorpers .
          OPTIONAL { ?anchorpers pou:turkishName ?apname . }
          ?anchorpers pou:nameOfPerson ?apFirstNameObject .
          ?apFirstNameObject pou:text ?firstName .
        }
        OPTIONAL {
          ?photograph pou:peopleOnPic ?peopleOnPic .
          OPTIONAL { ?peopleOnPic pou:turkishName ?name . }
          OPTIONAL { ?peopleOnPic pou:roi ?roi . }
          OPTIONAL {
            ?peopleOnPic pou:nameOfPerson ?firstNameObject .
            ?firstNameObject pou:text ?firstName .
            ?peopleOnPic pou:relToAnchorperson ?relationship .
          }
        }
    }
    OFFSET {{ page }}
    `, params);
    return result;
  }

}
