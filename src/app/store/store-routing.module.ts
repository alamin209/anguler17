import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Import component
import { StoreComponent } from "./store.component";
import { CategoryCountComponent } from "./category-count/category-count.component";
import { ProductFilterComponent } from "./product-filter/product-filter.component";
import { MobileFilterComponent } from "./mobile-filter/mobile-filter.component";
import { MarketplaceFilterComponent } from "./marketplace-filter/marketplace-filter.component";
import { MarketplaceMobileFilterComponent } from "./marketplace-mobile-filter/marketplace-mobile-filter.component";
import { SellerComponent } from "./seller/seller.component";
import { SellerBannerComponent } from "./seller/seller-banner/seller-banner.component";
import { SellerResourceComponent } from "./seller/seller-resource.component";
import { ProductFormComponent } from "./seller/product-form/product-form.component";
import { ProductTypeComponent } from "./seller/product-type/product-type.component";
import { MarketplaceComponent } from "./marketplace/marketplace.component";
import { MarketplaceBannerComponent } from "./marketplace/marketplace-banner/marketplace-banner.component";
//import { FundraisersComponent } from "./../home/fundraisers/fundraisers.component";
//import { EventsListComponent } from "./../events/events.component";
import { AuthGuard } from "../guards";

const routes: Routes = [

  {
    path: "marketplace",
    component: MarketplaceComponent,
  },
  {
    path: "marketplace/:category",
    component: MarketplaceComponent,
  },
  {
    path: "marketplace/category/:category",
    component: MarketplaceComponent,
  },
  {
    path: ":channel",
    component: StoreComponent,
  },
  {
    path: "",
    component: StoreComponent,
  },
  {
    path: "seller",
    component: SellerComponent,
  },
  {
    path: "seller/:sellername",
    component: SellerComponent,
  },
  {
    path: 'category/:category', component: StoreComponent
  },
  {
    path: ':channel/:category', component: StoreComponent
  },
  
  {
    path: "seller/resource/:resourceId",
    component: SellerResourceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "seller/product/type",
    component: ProductTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "seller/product/:pId",
    component: ProductFormComponent,
    canActivate: [AuthGuard],
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StoreRoutingModule {
  static component = [
    StoreComponent,
    CategoryCountComponent,
    ProductFilterComponent,
    MarketplaceFilterComponent,
    MobileFilterComponent,
    MarketplaceMobileFilterComponent,
    SellerComponent,
    SellerBannerComponent,
    SellerResourceComponent,
    ProductFormComponent,
    ProductTypeComponent,
    MarketplaceComponent,
    MarketplaceBannerComponent,
    //FundraisersComponent,
    //EventsListComponent
  ];
}
