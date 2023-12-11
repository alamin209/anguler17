import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.sass']
})
export class ForumComponent implements OnInit {

  constructor(
    private translate: TranslateService
  ) {
    // Set translate language
    translate.setDefaultLang('en');
   }

  ngOnInit() {
  }

}
