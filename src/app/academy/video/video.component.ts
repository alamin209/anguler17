import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.sass']
})
export class VideoComponent implements OnInit {

  constructor(
    private translate: TranslateService
  ) {
    // Set translate language
    translate.setDefaultLang('en');
   }

  ngOnInit() {
  }

}
