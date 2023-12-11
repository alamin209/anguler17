import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/auth/user.service'
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-active-account',
  templateUrl: './active-account.component.html',
  styleUrls: ['./active-account.component.sass']
})
export class ActiveAccountComponent implements OnInit {
  CID: Number = environment.config.CID;
  activeCode: any;
  message: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UserService: UserService,
    private toastr: ToastrService) { }

  ngOnInit() {
    // get url params
    this.activeCode = this.route.snapshot.params.code;
    // calling method
    this.activatedAccount();
  }

  // active user new account 
  activatedAccount(): void {
    if (this.activeCode) {
      let cond = {
        cid: this.CID,
        activation_code: this.activeCode,
      }
      this.UserService.activatedNewAccount(cond).subscribe(res => {
        if (res && res.message) {
          this.toastr.success(res.message);
          this.message = res.message;
        } else {
          this.message = "Something went wrong please try again!"
          this.toastr.error(this.message);
        }
      }, (error) => {
        if (error && error.error && error.error.error) {
          this.message = error.error.error
          this.toastr.error(this.message);
        } else {
          this.message = "Something went wrong please try again!"
          this.toastr.error(this.message);
        }
      });
    }
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }


}
