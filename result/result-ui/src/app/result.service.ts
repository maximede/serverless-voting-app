import {Result} from "./result";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/toPromise";

@Injectable()
export class ResultService {

  private resultURL = 'https://50z6s4zuu5.execute-api.us-west-1.amazonaws.com/prod/result';

  constructor(private http: Http) {
  }

  get(): Promise<Result> {
    return this.http.get(this.resultURL)
      .toPromise()
      .then(response => {
        console.log(response.json());

        return response.json() as Result
      }).catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

}
