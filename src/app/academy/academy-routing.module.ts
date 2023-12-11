import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import component 
import { VideoComponent } from './video/video.component';
import { AcademyComponent } from "./academy/academy.component";
import { UploadMediaComponent } from "./upload-media/upload-media.component";
import { VideoDetailsComponent } from "./video-details/video-details.component";

import { AuthGuard } from '../guards';

// Manage routing 
const routes: Routes = [
  {
    path: '',
    component: VideoComponent,
    children: [
    {
      path: 'academy',
      component: AcademyComponent, canActivate: [AuthGuard]
    }, 
    {
      path: 'academy/:type',
      component: AcademyComponent, canActivate: [AuthGuard]
    }, 
    {
      path: 'academy/channel/:channel_slug',
      component: AcademyComponent, canActivate: [AuthGuard]
    }, 
    {
      path: 'video/:slug',
      component: VideoDetailsComponent
    },
    {
      path: 'academy/video/:slug',
      component: VideoDetailsComponent
    }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcademyRoutingModule {
  static component = [VideoComponent, AcademyComponent, UploadMediaComponent, VideoDetailsComponent ];
}

