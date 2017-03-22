import {Component} from "@angular/core";
import {Result} from "./result";
import {ResultService} from "./result.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  result = new Result();
  voteAPercent: number;
  voteBPercent: number;

  constructor(private resultService: ResultService) {
    setInterval(() => {
      this.getResults();
    }, 1000 * 6 * 5);
  }

  private setPercent(result: Result): void {
    this.voteAPercent = Math.round(result.voteACount / result.totalCount * 100);

    this.voteBPercent = 100 - this.voteAPercent;
  }


  getResults(): void {
    this.resultService.get().then(result => {
      this.result = result
      this.setPercent(this.result);
    });
  }

  ngOnInit(): void {
    this.getResults();
    //this.getAlarmDetail("prod-pixel-cpu-credit-low");
  }
}
