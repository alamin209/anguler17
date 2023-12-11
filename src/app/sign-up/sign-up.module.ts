import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing component mange routing and import custom component.
import { SignUpRoutingModule } from './sign-up-routing.module';

// Import shared module
import { SharedModule } from '../shared/shared.module';
// Import google autocomplete address module
import { AutocompleteComponent  } from './google-places.component';

@NgModule({
  declarations: [
    SignUpRoutingModule.component,
    AutocompleteComponent,
    ],
  imports: [
    CommonModule,
    SignUpRoutingModule,
    SharedModule,
  ]
})
export class SignUpModule { }
