import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import { HomeService } from "../services/home/home.service";
import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from "ngx-bootstrap/modal";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Title, Meta } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { NewsService } from "../services/news/news.service";
import { ResourcesService } from "../services/resources/resources.service";
import { VideoService } from "../services/video/video.service";

// Import environment config file.
import { environment } from "../../environments/environment";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.sass"],
})
export class HomeComponent implements OnInit {
  secureForm;
  cmsPageData: any;
  sliderData: Array<[]>;
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  IS_STORE: boolean = environment.config.IS_STORE;
  PageLocked: any;
  modalRef: BsModalRef;
  localStorage: any;
  ISHomePage: any;

  @ViewChild("PageProtectModal", {}) PageProtectModal: ModalDirective;

  constructor(
    private HomeService: HomeService,
    private NewsService: NewsService,
    private ResourcesService: ResourcesService,
    private VideoService: VideoService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private metaTagService: Meta,
    private titleService: Title
  ) {}
  ngOnInit() {
    this.PageLocked = false;
    this.ISHomePage = true;
    // Define review form
    this.secureForm = this.formBuilder.group({
      p_username: ["", Validators.required],
      p_password: ["", Validators.required],
    });

    // calling method
    this.getCmsPage();
  }

  // Fetch cms page detail data
  getCmsPage(): void {
    let PageProtectModal = "PageProtectModal";
    // Set conditions
    let cond: any = {
      cid: this.CID,
      home_page_flag: 1,
    };
    this.HomeService.getCmsPage(cond).subscribe(
      (res) => {
        if (res && res.data && res.data && res.data.pageData) {
          this.cmsPageData = res.data.pageData; // Set page data

          let page_desc = this.cmsPageData.page_desc;

          
          if (page_desc.includes("[shortcode]")) {
            var shortcode = page_desc
              .split("[shortcode]")
              .pop()
              .split("[/shortcode]")[0];
            if (shortcode == "recent_blog_posts") {
              this.NewsService.getLatestNewsShortCode(cond).subscribe(
                (res) => {
                  if (res && res.data && res.data.length) {
                    this.cmsPageData.page_desc =
                      this.cmsPageData.page_desc.replace(
                        "[shortcode]" + shortcode + "[/shortcode]",
                        res.html
                      );
                  }
                },
                (err) => {}
              );
            }
          }

          if (page_desc.includes("[shortcode2]")) {
            var shortcode2 = page_desc
              .split("[shortcode2]")
              .pop()
              .split("[/shortcode2]")[0];
            if (shortcode2 == "testimonials") {
              this.HomeService.getTestimonialsShortCode(cond).subscribe(
                (res2) => {
                  if (res2 && res2.data && res2.data.length) {
                    this.cmsPageData.page_desc =
                      this.cmsPageData.page_desc.replace(
                        "[shortcode2]" + shortcode2 + "[/shortcode2]",
                        res2.html
                      );

                    setTimeout(function () {
                      if (jQuery("#HomeTestimonialsCarousel").length) {
                        jQuery("#HomeTestimonialsCarousel").owlCarousel({
                          loop: true,
                          autoplay: true,
                          autoplayHoverPause: false,
                          nav: false,
                          margin: 0,
                          dots: true,
                          mouseDrag: false,
                          touchDrag: false,
                          slideSpeed: 200000,
                          smartSpeed: 300000,
                          autoplaySpeed: 200000,
                          paginationSpeed: 200000,
                          items: 1,
                          animateIn: "fadeIn",
                          animateOut: "fadeOut",
                        });
                      }
                    }, 1500);
                  }
                },
                (err) => {}
              );
            }
          }
          
          

          //console.log(this.cmsPageData.page_desc);

          // set meta tags values
          let title = this.cmsPageData.meta_title;
          let Description = this.cmsPageData.page_meta;
          let keywords = this.cmsPageData.page_metakey;
          this.titleService.setTitle(title);

          this.metaTagService.updateTag({
            name: "keywords",
            content: keywords,
          });
          this.metaTagService.updateTag({
            name: "description",
            content: Description,
          });

          let ogtitle = title;
          let ogdescription = Description;
          let ogurl = location.origin;
          if (this.cmsPageData.home_page_flag == 0) {
            ogurl = location.origin + "/" + this.cmsPageData.page_name;
          }
          let ogimage =
            res.data && res.data.slider && res.data.slider.length
              ? this.PORTAL_URL +
                "newcms/files/slider/" +
                this.cmsPageData.CID +
                "/" +
                res.data.slider[0].slider_image
              : location.origin +
                "/assets/Facebook-Auto-populated-Image-1200x630.jpg";

          this.metaTagService.updateTag({
            property: "og:title",
            content: ogtitle,
          });
          this.metaTagService.updateTag({
            property: "og:description",
            content: ogdescription,
          });
          this.metaTagService.updateTag({ property: "og:url", content: ogurl });
          this.metaTagService.updateTag({
            property: "og:image",
            content: ogimage,
            itemprop: "image",
          });

          this.metaTagService.updateTag({
            name: "twitter:title",
            content: ogtitle,
          });
          this.metaTagService.updateTag({
            name: "twitter:description",
            content: ogdescription,
          });
          this.metaTagService.updateTag({
            name: "twitter:card",
            content: ogimage,
          });
          this.metaTagService.updateTag({
            name: "twitter:image",
            content: ogimage,
            itemprop: "image",
          });

          if (
            res.data.pageData &&
            res.data.pageData.page_username &&
            res.data.pageData.page_password
          ) {
            let _SPassed: any = localStorage.getItem(
              res.data.pageData.ID + "_SPassed"
            );

            if (!_SPassed) {
              this.PageLocked = true;
              this.PageProtectModal.show();
              jQuery(document).ready(function () {
                jQuery(document.body).addClass("PageLocked");
              });
            }
          }
          this.sliderData =
            res.data.slider && res.data.slider.length ? res.data.slider : []; // Set slider data
          console.log(this.sliderData);
          jQuery(document).ready(function () {
            if (jQuery("#RecentFundingCarousel").length) {
              jQuery("#RecentFundingCarousel").owlCarousel({
                loop: true,
                autoplay: true,
                autoplayHoverPause: false,
                nav: false,
                dots: true,
                mouseDrag: true,
                touchDrag: true,
                smartSpeed: 900,
                items: 1,
              });
            }

            jQuery(".jsScroll").click(function (event) {
              event.preventDefault();
              jQuery("html, body").animate(
                { scrollTop: jQuery(jQuery(this).attr("href")).offset().top },
                500
              );
            });

            // Mobile Category Accordian script
            jQuery(document).ready(function () {
              jQuery(".mobile-leftpanel-category").on("click", function () {
                if (jQuery(this).hasClass("is--opened")) {
                  jQuery(".mobile-leftpanel-category").removeClass(
                    "is--opened"
                  );
                } else {
                  jQuery(".mobile-leftpanel-category").removeClass(
                    "is--opened"
                  );
                  jQuery(this).addClass("is--opened");
                }
                jQuery(this)
                  .next()
                  .slideToggle(500)
                  .siblings(".mobile-leftpanel-body")
                  .slideUp();
              });
            });
          });
        }
      },
      (err) => {}
    );
  }

  // for model
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  // save product review
  onSubmitSecureForm(frmData) {
    this.markFormGroupDirtied(this.secureForm);
    if (this.secureForm.valid) {
      if (
        frmData &&
        this.cmsPageData &&
        frmData.p_username == this.cmsPageData.page_username &&
        frmData.p_password == this.cmsPageData.page_password
      ) {
        localStorage.setItem(this.cmsPageData.ID + "_SPassed", "true");
        this.PageProtectModal.hide();
        window.location.reload();
      } else {
        this.toastr.error("Invalid Username & Password", "Error!");
        // reset from
        this.secureForm.reset();
      }
    } else {
    }
  }

  // check validation for whole form
  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsDirty();
      if (control.controls) {
        this.markFormGroupDirtied(control);
      }
    });
  }
}
