import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

// Routing component mange routing and import custom component.
import { AccountRoutingModule } from "./account-routing.module";

// Import shared module
import { SharedModule } from "../shared/shared.module";

// Import google autocomplete address module
import { AutocompleteComponent } from "./google-places.component";

// Import your AvatarModule
import { AvatarModule } from "ngx-avatar-2";

// import { Ng5SliderModule } from "ng5-slider";
import { NgxSliderModule } from 'ngx-slider-v2';

// For slider
import { CarouselModule } from "ngx-owl-carousel-o";
// Import your library
import { SlickCarouselModule } from "ngx-slick-carousel";

// For Masonry
import { NgxMasonryModule } from "ngx-masonry";

 import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown-ivy';
import { FormsModule } from "@angular/forms";
import { TagInputModule } from "ngx-chips";
import { VideoPortalModule } from "../academy/academy.module";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";

//export const options: Partial<IConfig> | (() => Partial<IConfig>);

@NgModule({
  declarations: [AccountRoutingModule.component, AutocompleteComponent],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    CarouselModule,
    NgxMasonryModule,
    SlickCarouselModule,
    AvatarModule,
    NgxSliderModule,
    CKEditorModule,
    AngularMultiSelectModule,
    FormsModule,
    TagInputModule,
    VideoPortalModule
  ],
})
export class AccountModule {}
