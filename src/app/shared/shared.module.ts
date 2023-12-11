import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";

// This for internationalization language.
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { TruncatePipe } from "./pipe/truncate.pipe";
import { SafeHtmlPipe } from "./pipe/safe-html.pipe";

// Load all ngx bootstrap modules.
 
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { ModalModule } from 'ngx-bootstrap/modal'
import { PopoverModule } from 'ngx-bootstrap/popover'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { RatingModule } from 'ngx-bootstrap/rating'
import { PaginationModule } from 'ngx-bootstrap/pagination' 
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// For error
import { ToastrModule } from "ngx-toastr";

// For Input Masking


// For Scroll To
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";

// Fittext
import { AngularFittextModule } from "angular-fittext";

// InfiniteScrollModule
import { InfiniteScrollModule } from "ngx-infinite-scroll";

// added global component
import { NewsletterComponent } from "../newsletter/newsletter.component";
import { BreadCrumbsComponent } from "../bread-crumbs/bread-crumbs.component";
import { TipComponent } from "../tip/tip.component";
import { LeftSideBarComponent } from "../left-side-bar/left-side-bar.component";
import { EventsComponent } from "../events/events.component";

// AoT requires an exported function for factories and this for language
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    CommonModule,
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    PopoverModule.forRoot(),
    AccordionModule.forRoot(),
    RatingModule.forRoot(),
    PaginationModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: "toast-top-center",
    }),
    ReactiveFormsModule,
    FormsModule, 
    ScrollToModule.forRoot(),
    InfiniteScrollModule,
  ],
  exports: [
    TruncatePipe,
    SafeHtmlPipe,
    TranslateModule,
    TooltipModule,
    ModalModule,
    PopoverModule,
    AccordionModule,
    RatingModule,
    PaginationModule,
    ToastrModule,
    NewsletterComponent,
    TipComponent,
    LeftSideBarComponent,
    BreadCrumbsComponent,
    ReactiveFormsModule,
    FormsModule, 
    ScrollToModule,
    InfiniteScrollModule,
    EventsComponent,
  ],
  declarations: [
    TruncatePipe,
    SafeHtmlPipe,
    NewsletterComponent,
    BreadCrumbsComponent,
    TipComponent,
    LeftSideBarComponent,
    EventsComponent,
  ],
})
export class SharedModule {}
