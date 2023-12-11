import { Component, OnInit,Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { StoreService } from '../../../../services/store/store.service';
// Import environment config file.
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-payment-banner',
  templateUrl: './payment-banner.component.html',
  styleUrls: ['./payment-banner.component.sass']
})
export class PaymentBannerComponent implements OnInit {

  @Input() CartToken: any;
  constructor(private StoreService: StoreService,
    private router: Router, private translate: TranslateService,
    private route: ActivatedRoute) {
    // Set translate language
    translate.setDefaultLang('en');
  }

  ngOnInit() {
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

}
