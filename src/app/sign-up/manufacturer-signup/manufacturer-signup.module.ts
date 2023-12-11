import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing component mange routing and import custom component.
import { ManufacturerSignupRoutingModule } from './manufacturer-signup-routing.module';

// Import shared module
import { SharedModule } from '../../shared/shared.module';
// Import google autocomplete address module
import { AutocompleteComponent  } from './google-places.component';

@NgModule({
  declarations: [
    ManufacturerSignupRoutingModule.component,
    AutocompleteComponent,
    ],
  imports: [
    CommonModule,
    ManufacturerSignupRoutingModule,
    SharedModule,
  ]
})
export class ManufacturerSignupModule { }
