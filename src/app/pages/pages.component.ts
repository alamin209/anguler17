import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import {
  NavigationEnd,
  NavigationStart,
  Router,
  ActivatedRoute,
} from "@angular/router";
import { HomeService } from "../services/home/home.service";
import { EventsService } from "../services/events/events.service";
import { ResourcesService } from "../services/resources/resources.service";
import { VideoService } from "../services/video/video.service";
import {
  BsModalService,
  BsModalRef,
  ModalDirective,
} from "ngx-bootstrap/modal";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Title, Meta } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
// Import environment config file.
import { environment } from "../../environments/environment";

// Declear jquery
declare var jQuery: any;

@Component({
  selector: "app-pages",
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.sass"],
})
export class PagesComponent implements OnInit {
  secureForm;
  cmsPageData: any;
  sliderData: Array<[]>;
  CID: number = environment.config.CID;
  PORTAL_URL: string = environment.config.PORTAL_URL;
  PageLocked: any;
  ISHomePage: any;
  modalRef: BsModalRef;
  private path: any;

  @ViewChild("PageProtectModal", {}) PageProtectModal: ModalDirective;

  constructor(
    private HomeService: HomeService,
    private EventsService:EventsService,
    private ResourcesService: ResourcesService,
    private VideoService: VideoService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private metaTagService: Meta,
    private titleService: Title
  ) {
    // get activated route
    this.activatedRoute.url.subscribe((url) => {
      // calling method
      this.getCmsPage();
    });
  }
  ngOnInit() {
    this.PageLocked = false;
    this.ISHomePage = false;
    // Define review form
    this.secureForm = this.formBuilder.group({
      p_username: ["", Validators.required],
      p_password: ["", Validators.required],
    });
    // calling method
    // this.getCmsPage();
  }

  // Fetch cms page detail data
  getCmsPage(): void {
    // mange slug
    this.path = this.router.url;
    this.path = this.path.slice(
      0,
      this.path.indexOf("?") === -1 ? this.path.length : this.path.indexOf("?")
    );
    this.path = this.path.replace(/^\/|\/$/g, "");

    // Set conditions
    let cond: any = {
      cid: this.CID,
      page_name: this.path.toLowerCase(),
    };
    this.sliderData = [];
    this.cmsPageData = [];
    this.HomeService.getCmsPage(cond).subscribe(
      (res) => {
        if (res && res.data && res.data && res.data.pageData) {
          this.cmsPageData = res.data.pageData; // Set page data

          let page_desc = this.cmsPageData.page_desc;

          if (page_desc.includes("[shortcode4]")) {

            var shortcode = page_desc.split("[shortcode4]").pop().split("[/shortcode4]")[0];
            if (shortcode == "events_list") {
              let cond: any = {
                cid: this.CID,
              };
              this.EventsService.getEventsList(cond).subscribe(
                (res) => {
                  if (res && res.data && res.data.length) {
                    this.cmsPageData.page_desc =
                      this.cmsPageData.page_desc.replace(
                        "[shortcode4]" + shortcode + "[/shortcode4]",
                        res.html
                      );
                  }else{
                    this.cmsPageData.page_desc.replace("[shortcode4]" + shortcode + "[/shortcode4]","");
                  }
                },
                (err) => {
                  this.cmsPageData.page_desc.replace("[shortcode4]" + shortcode + "[/shortcode4]","");
                }
              );
            }
          }

          

          if (page_desc.includes("[shortcode]")) {
            var shortcode = page_desc.split("[shortcode]").pop().split("[/shortcode]")[0];
            var shortcodeSlug = shortcode.split('[blog_posts CategorySlug="').pop().split('" Limit')[0];
            var limit = shortcode.split('Limit="').pop().split('"]')[0];
            if (shortcodeSlug) {
              cond.category_slug = shortcodeSlug;
              if (limit) {
                cond.limit = limit;
              }
              this.HomeService.getShortCodeByCategoryId(cond).subscribe(
                (res3) => {
                  if (res3 && res3.data && res3.data.length) {
                    this.cmsPageData.page_desc =
                      this.cmsPageData.page_desc.replace(
                        "[shortcode]" + shortcode + "[/shortcode]",
                        res3.html
                      );
                  }
                },
                (err) => {
                  this.cmsPageData.page_desc =
                    this.cmsPageData.page_desc.replace(
                      "[shortcode]" + shortcode + "[/shortcode]",
                      '<div class="row justify-content-center mb-5"><div class="w-50"><div class="alert alert-warning p-4 text-center"><strong>No Post Available</strong></div></div></div>'
                    );
                }
              );
            }
          }

          if (page_desc.includes("[shortcode_resources]")) {
            var shortcode = page_desc
              .split("[shortcode_resources]")
              .pop()
              .split("[/shortcode_resources]")[0];
              
            if (shortcode == "recent") {
              this.ResourcesService.getLatestResourcesShortCode(cond).subscribe(
                (res) => {
                  if (res && res.data && res.data.length) {
                    this.cmsPageData.page_desc =
                      this.cmsPageData.page_desc.replace(
                        "[shortcode_resources]" + shortcode + "[/shortcode_resources]",
                        res.html
                      );
                  }
                },
                (err) => {}
              );
            }
          }

          if (page_desc.includes("[shortcode_videos]")) {
            var shortcode = page_desc
              .split("[shortcode_videos]")
              .pop()
              .split("[/shortcode_videos]")[0];
            if (shortcode == "recent") {
              this.VideoService.getLatestVideosShortCode(cond).subscribe(
                (res) => {
                  if (res && res.data && res.data.length) {
                    this.cmsPageData.page_desc =
                      this.cmsPageData.page_desc.replace(
                        "[shortcode_videos]" + shortcode + "[/shortcode_videos]",
                        res.html
                      );
                  }
                },
                (err) => {}
              );
            }
          }



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
        } else {
          this.cmsPageData = [];
          this.sliderData = [];
          this.router.navigateByUrl("/not-found", { replaceUrl: true });
        }
      },
      (err) => {}
    );
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  // for model
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  // save product review
  onSubmitSecureForm(frmData) {
    this.markFormGroupDirtied(this.secureForm);
    if (this.secureForm.valid) {
      console.log(this.cmsPageData.page_username);

      let cmsPage = this.cmsPageData;
      if (
        cmsPage &&
        frmData.p_username == cmsPage.page_username &&
        frmData.p_password == cmsPage.page_password
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
