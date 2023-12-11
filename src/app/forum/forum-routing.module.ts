import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import component 
import { ForumComponent } from './forum/forum.component';
import { ForumListComponent } from "./forum-list/forum-list.component";
import { AllForumComponent } from "./all-forum/all-forum.component";
import { ForumBannerComponent } from "./forum-banner/forum-banner.component";
import { ForumDetailComponent } from "./forum-detail/forum-detail.component";
import { ForumCommentsComponent } from "./forum-detail/forum-comments/forum-comments.component";
import { NewForumComponent } from "./new-forum/new-forum.component";


import { AuthGuard } from '../guards';

// Manage routing 
const routes: Routes = [
  {
    path: '',
    component: ForumComponent,
    children: [
        {
          path: '',
          component: ForumListComponent, canActivate: [AuthGuard]
        }, 
        { path: "all", component: AllForumComponent,canActivate: [AuthGuard] },
        { path: "new", component: NewForumComponent,canActivate: [AuthGuard] },
        { path: "details/:slug", component: ForumDetailComponent,canActivate: [AuthGuard]},
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule {
  static component = [ForumComponent,AllForumComponent,ForumListComponent,ForumBannerComponent, ForumDetailComponent,ForumCommentsComponent,NewForumComponent
  ];
}

