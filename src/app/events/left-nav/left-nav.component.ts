import { Component, OnInit } from "@angular/core";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-left-nav",
  templateUrl: "./left-nav.component.html",
  styleUrls: ["./left-nav.component.sass"],
})
export class LeftNavComponent implements OnInit {
  
  setTab: string;
  ActivePage: any;

  constructor() {
    
    // set product detail tabs
    this.setTab = "OpenTickets";

  }

  ngOnInit() {

    let pathname = window.location.pathname;
    pathname = pathname.replace("/", "");
    
    let pathname1 = pathname.substr(0, pathname.lastIndexOf("/"));
    if (pathname1 != '') {
      this.ActivePage = pathname1;
    } else {
      this.ActivePage = pathname;
    }

  }
}
