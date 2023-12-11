import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from "rxjs";
import * as _ from "lodash";
import * as uuid from "uuid";
import * as qs from "qs";
import { ToastrService } from "ngx-toastr";
import { Title, Meta } from "@angular/platform-browser";
import { Globals } from "../../../common/globals";
// Import environment config file.
import { environment } from "src/environments/environment";

declare var jQuery: any;

@Component({
  selector: "app-podcasts",
  templateUrl: "./podcasts.component.html",
  styleUrls: ["./podcasts.component.sass"],
})
export class PodcastsComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    jQuery("#audio").audioPlayer();
  }
}
