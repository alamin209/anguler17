import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-add-documents",
  templateUrl: "./add-documents.component.html",
  styleUrls: ["./add-documents.component.sass"],
})
export class AddDocumentsComponent implements OnInit {

  ActivePage:any;

  constructor() {}

  ngOnInit() {

    this.ActivePage = "add-document";

  }
}
