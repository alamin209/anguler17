import { Component, OnInit } from "@angular/core";

// Handle the global property
import { Globals } from "../../common/globals";
import { Router } from "@angular/router";
import { HomeService } from "../../services/home/home.service";
import * as _ from "lodash";

// Import environment config file.
import { environment } from "../../../environments/environment";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-faqs",
  templateUrl: "./faqs.component.html",
  styleUrls: ["./faqs.component.sass"],
})
export class FaqsComponent implements OnInit {
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  Faqs: any = [];

  constructor(
    private globals: Globals,
    private HomeService: HomeService,
    private router: Router
  ) {}

  ngOnInit() {
    // Call method
    this.getFaqs();
  }

  /**
   * Define method for slider
   */
  getFaqs(): void {
    let cond = {
      cid: this.CID,
    };
    this.HomeService.getFaqs(cond).subscribe(
      (res) => {
        if (res && res.data && res.data.length) {
          // Set data for subscribe Testimonials list
          this.Faqs = res.data;
          // setTimeout(function () {
          //   if (jQuery("#HomeFaqsCarousel").length) {
          //     jQuery("#HomeFaqsCarousel").owlCarousel({
          //       loop: true,
          //       autoplay: true,
          //       autoplayHoverPause: false,
          //       nav: false,
          //       margin: 0,
          //       dots: true,
          //       mouseDrag: false,
          //       touchDrag: false,
          //       smartSpeed: 1100,
          //       items: 1,
          //       animateIn: "fadeIn",
          //       animateOut: "fadeOut",
          //     });
          //   }
          // }, 500);

          var action = "click";
          var speed = "500";

          // Accordian
          jQuery(document).ready(function () {
            jQuery(".question").on(action, function () {
              if (jQuery(this).hasClass("is--opened")) {
                jQuery(".question").removeClass("is--opened");
              } else {
                jQuery(".question").removeClass("is--opened");
                jQuery(this).addClass("is--opened");
              }
              jQuery(this)
                .next()
                .slideToggle(speed)
                .siblings(".answer")
                .slideUp();
            });
          });
        }
      },
      (err) => {}
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }
}
