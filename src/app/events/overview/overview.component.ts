import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.sass"],
})
export class OveriewComponent implements OnInit {

  ActivePage:any;
  
  constructor() {}

  ngOnInit() {

    this.ActivePage = "overview";

  }
}
