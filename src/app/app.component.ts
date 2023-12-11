import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Spinkit } from 'ng-http-loader';
import { filter, pairwise } from 'rxjs/operators';
import { Router, RoutesRecognized,NavigationEnd } from '@angular/router';
import { UserService } from './services/auth/user.service';
// Declear jquery 
declare var jQuery: any;
declare let fbq:Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  spinkit = Spinkit;
  
  constructor(
    private translate: TranslateService, 
    private router: Router,
    private UserService: UserService
    ) {
    // Set translate language
    translate.setDefaultLang('en');
    // return previous url 
    this.router.events.pipe(filter((e: any) => e instanceof RoutesRecognized), pairwise()).subscribe((e: any) => {
      // set previous url in service
      UserService.setPreviousUrl(e[0].urlAfterRedirects);
      // remove zoom
      jQuery('.zoomContainer').remove()
    });

    router.events.subscribe((y: NavigationEnd) => {
      if(y instanceof NavigationEnd){
        fbq('track', 'PageView');
        if(y.url.includes('shop')){
          console.log('shop pages')
          fbq('init', '386725633091640');
        }else{
          fbq('init', '1579613112410112');
        }
        console.log(y.url);
      }
    });

  }
}
