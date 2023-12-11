import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing component mange routing and import custom component.
import { AcademyRoutingModule } from './academy-routing.module';

// Import shared module
import { SharedModule } from '../shared/shared.module';
import { TagInputModule } from "ngx-chips";
import { UploadMediaComponent } from './upload-media/upload-media.component';

//export const options: Partial<IConfig> | (() => Partial<IConfig>);

@NgModule({
  declarations: [
    AcademyRoutingModule.component,
    ],
  imports: [
    CommonModule,
    AcademyRoutingModule,
    SharedModule,
    TagInputModule,
  ],
  exports: [UploadMediaComponent]
})
export class VideoPortalModule { }
