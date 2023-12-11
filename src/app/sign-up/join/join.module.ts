import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing component mange routing and import custom component.
import { JoinRoutingModule } from './join-routing.module';

// Import shared module
import { SharedModule } from '../../shared/shared.module';
// Import google autocomplete address module

@NgModule({
  declarations: [
    JoinRoutingModule.component,
    ],
  imports: [
    CommonModule,
    JoinRoutingModule,
    SharedModule,
  ]
})
export class JoinModule { }
