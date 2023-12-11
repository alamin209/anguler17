import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxSliderModule } from 'ngx-slider-v2';

// Import your AvatarModule
import { AvatarModule } from "ngx-avatar-2";

// Routing component mange routing and import custom component.
import { StoreRoutingModule } from "./store-routing.module";

// Import shared module
import { SharedModule } from "../shared/shared.module";
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown-ivy';
import { FormsModule } from "@angular/forms";
import { TagInputModule } from "ngx-chips";
import { VideoPortalModule } from "../academy/academy.module";

@NgModule({
  declarations: [StoreRoutingModule.component],
  imports: [
    CommonModule,
    StoreRoutingModule,
    SharedModule,
    NgxSliderModule,
    AvatarModule,
    CKEditorModule,
    AngularMultiSelectModule,
    FormsModule,
    TagInputModule,
    VideoPortalModule
  ],
})
export class StoreModule {}
