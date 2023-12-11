import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing component mange routing and import custom component.
import { ForumRoutingModule } from './forum-routing.module';

// Import shared module
import { SharedModule } from '../shared/shared.module';
import { TagInputModule } from "ngx-chips";


//export const options: Partial<IConfig> | (() => Partial<IConfig>);

@NgModule({
  declarations: [
    ForumRoutingModule.component,
    ],
  imports: [
    CommonModule,
    ForumRoutingModule,
    SharedModule,
    TagInputModule
  ]
})
export class ForumModule { }
