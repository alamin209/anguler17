import { Component, OnInit } from "@angular/core";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-documents",
  templateUrl: "./documents.component.html",
  styleUrls: ["./documents.component.sass"],
})
export class DocumentsComponent implements OnInit {
  setTab: string;
  ActivePage:any;

  constructor() {
    // set product detail tabs
    this.setTab = "OpenTickets";
    this.ActivePage = "documents";

  }

  ngOnInit() {}
}
