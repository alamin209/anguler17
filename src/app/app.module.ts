import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";

// For slider
import { CarouselModule } from "ngx-owl-carousel-o";
 

// Slimscroll
import { NgSlimScrollModule, SLIMSCROLL_DEFAULTS } from "ngx-slimscroll";

// Loading for every request
import { NgHttpLoaderModule } from "ng-http-loader";

// Routing component mange routing and import custom component.
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

// Import shared module
import { SharedModule } from "./shared/shared.module";

// Import captcha module
import { NgxCaptchaModule } from "ngx-captcha";

import { TagInputModule } from "ngx-chips";

// Import library module

// Import your library
import { SlickCarouselModule } from "ngx-slick-carousel";
import { PoddetailsComponent } from './training/products/podcasts/poddetails/poddetails.component';

@NgModule({
  declarations: [AppComponent, AppRoutingModule.component, PoddetailsComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    AppRoutingModule,
    SharedModule,
    NgSlimScrollModule,
    HttpClientModule,
    CarouselModule, 
    BrowserAnimationsModule,
    FormsModule,
    NgHttpLoaderModule.forRoot(),
    NgxCaptchaModule,
    TagInputModule,
    SlickCarouselModule,
  ],
  providers: [
    {
      provide: SLIMSCROLL_DEFAULTS,
      useValue: {
        alwaysVisible: false,
        gridOpacity: "0.2",
        barOpacity: "0.5",
        gridBackground: "#fff",
        gridWidth: "6",
        gridMargin: "2px 2px",
        barBackground: "#fff",
        barWidth: "20",
        barMargin: "2px 2px",
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
