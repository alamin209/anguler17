import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

// Import Custome component.
import { HomeComponent } from "./home/home.component";
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { SliderComponent } from "./home/slider/slider.component";
import { MenuComponent } from "./header/menu/menu.component";
//import { ManufacturerSignupComponent } from './sign-up/manufacturer-signup/manufacturer-signup.component';
import { ThankYouComponent } from "./thank-you/thank-you.component";
import { ActiveAccountComponent } from "./active-account/active-account.component";
import { LoginComponent } from "./login/login.component";
import { ForgetComponent } from "./forget/forget.component";
import { CategoryComponent } from "./home/category/category.component";
import { AttachmentsAccessoriesComponent } from "./home/attachments-accessories/attachments-accessories.component";
import { TestimonialsComponent } from "./home/testimonials/testimonials.component";
import { FaqsComponent } from "./home/faqs/faqs.component";
import { FeaturedProductsComponent } from "./home/featured-products/featured-products.component";
import { FeaturedResourcesComponent } from "./home/featured-resources/featured-resources.component";
import { LatestBlogPostsComponent } from "./home/latest-blog-posts/latest-blog-posts.component";
import { FundraisersComponent } from "./home/fundraisers/fundraisers.component";
import { HomeFiltersComponent } from "./home/home-filters/home-filters.component";
import { ProductProjectComponent } from "./home/product-project/product-project.component";
import { HomecmsComponent } from "./home/homecms/homecms.component";
import { PagesComponent } from "./pages/pages.component";
import { NewsComponent } from "./news/news.component";
import { NewsDetailComponent } from "./news/news-detail/news-detail.component";
import { CommentsComponent } from "./news/news-detail/comments/comments.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { SuccessComponent } from "./store/cart/success/success.component";
import { ResetComponent } from "./reset/reset.component";
import { SearchComponent } from "./product/search/search.component";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { ResourcesComponent } from "./resources/resources.component";
import { ResourcesBannerComponent } from "./resources/resources-banner/resources-banner.component";
import { CategoryResourcesComponent } from "./resources/category-resources/category-resources.component";
import { ResourcesDetailComponent } from "./resources/resources-detail/resources-detail.component";
import { VideoComponent } from "./resources/video/video.component";
import { WhitepaperComponent } from "./resources/whitepaper/whitepaper.component";
import { AnnouncementComponent } from "./resources/announcement/announcement.component";
import { ContentComponent } from "./resources/content/content.component";
import { PodcastComponent } from "./resources/podcast/podcast.component";


import { ResourcesCommentsComponent } from "./resources/resources-detail/comments/comments.component";
import { SearchContentComponent } from "./search/search.component";
import { AllTipsComponent } from "./all-tips/all-tips.component";
import { EventsComponent } from "./events/events.component";
import { TrainingComponent } from "./training/training.component";
import { ProductsComponent } from "./training/products/products.component";
import { OveriewComponent } from "./events/overview/overview.component";
import { TicketingComponent } from "./events/ticketing/ticketing.component";
import { CreateTicketComponent } from "./events/create-ticket/create-ticket.component";
import { ViewTicketComponent } from "./events/view-ticket/view-ticket.component";
import { LeftNavComponent } from "./events/left-nav/left-nav.component";

import { DocumentsComponent } from "./events/documents/documents.component";
import { AddDocumentsComponent } from "./events/add-documents/add-documents.component";
import { PodcastsComponent } from "./training/products/podcasts/podcasts.component";
import { PoddetailsComponent } from "./training/products/podcasts/poddetails/poddetails.component";

import { AuthGuard } from "./guards";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "sign-up", loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpModule) },
  {
    path: "sign-up/:package",
    loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpModule),
  },
  {
    path: "sign-up/:package/:action",
    loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpModule),
  },
  {
    path: "manufacturer-signup",
    loadChildren:
      () => import('./sign-up/manufacturer-signup/manufacturer-signup.module').then(m => m.ManufacturerSignupModule),
  },
  {
    path: "join-now",
    loadChildren: () => import('./sign-up/join/join.module').then(m => m.JoinModule),
  },
  { path: "thank-you", component: ThankYouComponent },
  { path: "thank-you/:slug", component: ThankYouComponent },
  { path: "active-account/:code", component: ActiveAccountComponent },
  { path: "login", component: LoginComponent },
  { path: "forget", component: ForgetComponent },
  { path: "reset/:token", component: ResetComponent },
  { path: "blog", component: NewsComponent },
  { path: "details/:slug", component: NewsDetailComponent },
  { path: "blog/post/:slug", component: NewsDetailComponent },
  { path: "success", component: SuccessComponent },
  { path: "member", loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: "shop", loadChildren: () => import('./store/store.module').then(m => m.StoreModule) },
  //{ path: 'shop/:category', loadChildren: './store/store.module#StoreModule' },
  // { path: "dashboard", component: DashboardComponent },
  { path: "faqs", component: FaqsComponent },
  {
    path: "product/:slug",
    loadChildren: () => import('./product/product.module').then((m) => m.ProductModule),
  },
  {
    path: "shop/product/p/:slug",
    loadChildren: () => import('./product/product.module').then(m => m.ProductModule),
  },
  { path: "cart", loadChildren: () => import('./store/cart/cart.module').then(m => m.CartModule) },
  {
    path: "checkout",
    loadChildren: () => import('./store/cart/checkout/checkout.module').then(m => m.CheckoutModule),
  },
  {
    path: "checkout/:token",
    loadChildren: () => import('./store/cart/checkout/checkout.module').then(m => m.CheckoutModule),
  },
  {
    path: "payment",
    loadChildren: () => import('./store/cart/payment/payment.module').then(m => m.PaymentModule),
  },
  {
    path: "payment/:token",
    loadChildren: () => import('./store/cart/payment/payment.module').then(m => m.PaymentModule),
  },
  { path: "not-found", component: NotFoundComponent },
  { path: "contact-us", component: ContactUsComponent },
  {
    path: "resources",
    component: ResourcesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "resources/:category",
    component: ResourcesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "resources/posts/:category",
    component: CategoryResourcesComponent,
    canActivate: [AuthGuard],
  },
  { path: "resource/:slug", component: ResourcesDetailComponent },
  { path: "cp/:product_slug/:slug", component: ResourcesDetailComponent },
  {
    path: "tips",
    component: AllTipsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "training",
    component: TrainingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "training/:slug",
    component: ProductsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "products/v/:slug",
    component: ProductsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "products/podcasts",
    component: PodcastsComponent,
  },
  {
    path: "products/podcasts/details",
    component: PoddetailsComponent,
  },
  {
    path: "",
    loadChildren: () => import('./academy/academy.module').then(m => m.VideoPortalModule),
  },
  { path: "events", component: EventsComponent },
  { path: "forum", loadChildren: () => import('./forum/forum.module').then(m => m.ForumModule) },
  { path: "overview", component: OveriewComponent },
  { path: "tickets", component: TicketingComponent },
  { path: "tickets/create", component: CreateTicketComponent },
  { path: "tickets/view/:ticketid", component: ViewTicketComponent },

  { path: "documents", component: DocumentsComponent },
  { path: "add-documents", component: AddDocumentsComponent },
  {
    path: "search",
    component: SearchContentComponent,
    canActivate: [AuthGuard],
  },
  { path: "**", component: PagesComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    scrollPositionRestoration: "enabled"
}),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  static component = [
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    SliderComponent,
    MenuComponent,
    LoginComponent,
    ForgetComponent,
    ResetComponent,
    CategoryComponent,
    AttachmentsAccessoriesComponent,
    TestimonialsComponent,
    FaqsComponent,
    FeaturedProductsComponent,
    ProductProjectComponent,
    HomecmsComponent,
    PagesComponent,
    NotFoundComponent,
    NewsComponent,
    NewsDetailComponent,
    CommentsComponent,
    ThankYouComponent,
    SuccessComponent,
    SearchComponent,
    ContactUsComponent,
    ActiveAccountComponent,
    ResourcesComponent,
    ResourcesBannerComponent,
    ResourcesDetailComponent,
    VideoComponent,
    WhitepaperComponent,
    AnnouncementComponent,
    ContentComponent,
    PodcastComponent,
    ResourcesCommentsComponent,
    CategoryResourcesComponent, // this is for blog etc
    SearchContentComponent,
    AllTipsComponent,
    HomeFiltersComponent,
    FeaturedResourcesComponent,
    LatestBlogPostsComponent,
    TrainingComponent,
    ProductsComponent,
    OveriewComponent,
    TicketingComponent,
    CreateTicketComponent,
    ViewTicketComponent,
    LeftNavComponent,
    DocumentsComponent,
    AddDocumentsComponent,
    //EventsComponent
    FundraisersComponent,
    PodcastsComponent,
    PoddetailsComponent,
  ];
}
