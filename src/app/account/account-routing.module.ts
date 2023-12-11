import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

//import component
import { AccountComponent } from "./account/account.component";
import { MyAccountComponent } from "./my-account/my-account.component";
import { ProfileComponent } from "./profile/profile.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { OrderHistoryComponent } from "./order-history/order-history.component";
import { OrderDetailsComponent } from "./order-details/order-details.component";
import { TrackMyOrderComponent } from "./track-my-order/track-my-order.component";
import { SideBarComponent } from "./side-bar/side-bar.component";
import { WishListComponent } from "./wish-list/wish-list.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";
import { EditAddressComponent } from "./edit-address/edit-address.component";
import { ShippingAddressComponent } from "./shipping-address/shipping-address.component";

import { PaymentOptionsComponent } from "./payment-options/payment-options.component";
import { TaxExemptionComponent } from "./tax-exemption/tax-exemption.component";
import { FinancingComponent } from "./financing/financing.component";
import { AddPaymentOptionComponent } from "./add-payment-option/add-payment-option.component";
import { EditPaymentOptionComponent } from "./edit-payment-option/edit-payment-option.component";
import { CategoriesComponent } from "./categories/categories.component";
import { SubscriptionComponent } from "./subscription/subscription.component";
import { UpgradeSubscriptionComponent } from "./upgrade-subscription/upgrade-subscription.component";
import { StripeConnectComponent } from "./stripe-connect/stripe-connect.component";

import { MyProductsComponent } from "./my-products/my-products.component";
import { ProductTypeComponent } from "./my-products/product-type/product-type.component";
import { ProductFormComponent } from "./my-products/product-form/product-form.component";
import { ResourcesFormComponent } from "./my-products/resources-form/resources-form.component";
import { VideoFormComponent } from "./my-products/video-form/video-form.component";
import { AddVideoComponent } from "./my-products/add-video/add-video.component";

import { LeadsComponent } from "./leads/leads.component";
import { LeadFormComponent } from "./leads/lead-form/lead-form.component";


import { MySalesComponent } from "./my-sales/my-sales.component";


import { AuthGuard } from "../guards";

// Manage routing
const routes: Routes = [
  {
    path: "",
    component: MyAccountComponent,
    children: [
      {
        path: "",
        component: AccountComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "profile",
        component: ProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "shipping-addresses",
        component: ShippingAddressComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "change-password",
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "order-history",
        component: OrderHistoryComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "order-detail/:id",
        //component: OrderDetailsComponent, canActivate: [AuthGuard]
        component: OrderDetailsComponent,
      },
      {
        path: "track-my-order/:orderId/:id",
        component: TrackMyOrderComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "wish-list",
        component: WishListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "edit-profile",
        component: EditProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "edit-address",
        component: EditAddressComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "edit-address/:id",
        component: EditAddressComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "add-payment-option",
        component: AddPaymentOptionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "edit-payment-option/:id",
        component: EditPaymentOptionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "payment-options",
        component: PaymentOptionsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "tax-exemption",
        component: TaxExemptionComponent,
        canActivate: [AuthGuard],
      },

      {
        path: "financing",
        component: FinancingComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "categories",
        component: CategoriesComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "subscription",
        component: SubscriptionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "upgrade-subscription/:package",
        component: UpgradeSubscriptionComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "stripe-connect",
        component: StripeConnectComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "video/edit/:videoId",
        component: VideoFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "video/add",
        component: AddVideoComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "sales",
        component: MySalesComponent,
      },
      {
        path: "leads",
        component: LeadsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "leads/add",
        component: LeadFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "leads/edit/:id",
        component: LeadFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: ":products",
        component: MyProductsComponent,
      },
      {
        path: "products/type",
        component: ProductTypeComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "products/:ptype/add",
        component: ProductFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "products/:ptype/add",
        component: ProductFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "products/edit/:pId",
        component: ProductFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "resource/add",
        component: ResourcesFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "resource/edit/:pId",
        component: ResourcesFormComponent,
        canActivate: [AuthGuard],
      },
      
      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {
  static component = [
    MyAccountComponent,
    AccountComponent,
    ProfileComponent,
    ChangePasswordComponent,
    OrderHistoryComponent,
    OrderDetailsComponent,
    TrackMyOrderComponent,
    SideBarComponent,
    WishListComponent,
    EditProfileComponent,
    EditAddressComponent,
    ShippingAddressComponent,
    PaymentOptionsComponent,
    PaymentOptionsComponent,
    TaxExemptionComponent,
    FinancingComponent,
    AddPaymentOptionComponent,
    EditPaymentOptionComponent,
    CategoriesComponent,
    SubscriptionComponent,
    UpgradeSubscriptionComponent,
    StripeConnectComponent,
    MyProductsComponent,
    ProductTypeComponent,
    ProductFormComponent,
    ResourcesFormComponent,
    VideoFormComponent,
    AddVideoComponent,
    MySalesComponent,
    LeadFormComponent,
    LeadsComponent
  ];
}
