import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import component 
import { ManufacturerSignupComponent } from './manufacturer-signup.component';

const routes: Routes = [{
  path: '', component: ManufacturerSignupComponent
  }];

  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class ManufacturerSignupRoutingModule {
    static component = [ManufacturerSignupComponent];
 }

