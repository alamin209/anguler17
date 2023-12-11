import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/auth/user.service'

import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// Import environment config file.
import { environment } from '../../../environments/environment';

declare var GenCert: any;

@Component({
  selector: 'app-tax-exemption',
  templateUrl: './tax-exemption.component.html',
  styleUrls: ['./tax-exemption.component.sass']
})
export class TaxExemptionComponent implements OnInit {

  CertToken: any;
  CID: number = environment.config.CID;
  private path: any;
  pageNotFound : boolean = false;
  userData: any;
  CurrentuserData: any;
  UploadCertNow:any;
  CustomerCerticates:any;
  back:any;
  
  constructor(
    private UserService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private toastr: ToastrService,
    ) {
  }

  ngOnInit() {

    this.loadScript('https://app.certcapture.com/gencert2/js');  
    
    this.UploadCertNow = false;
    
    // get url params for params
    this.back = '';
    this.route.queryParamMap.subscribe(queryParams => {
      this.back = queryParams.get("back");
      console.log(queryParams);
      console.log(this.back);
      if(this.back){
        //this.changeRouter(this.back);
      }
    })
    
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      
      this.getUserData();
      
      
    });
    
    
    
  }
  
  
  loadScript(url) {
        console.log('preparing to load...')
        let node = document.createElement('script');
        node.src = url;
        node.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(node);
  }


  // get current user
  getUserData(): void {
    if (this.userData) {

      

      let dataObj = {
        cid: this.CID,
        userId: this.userData.id
      }
      this.UserService.getUserData(dataObj).subscribe(res => {
        if (res && res.data) {
		  this.UserService.setAccountDataList(res);
          this.CustomerCerticates = [];
          
          this.CurrentuserData = res.data;
          if(this.CurrentuserData && this.CurrentuserData.CertCaptureUser == 0){
            // calling method  for generate token
            this.createCustomer();
          }else{
            // calling method  for get customer profile
            this.getCustomerCertificate();
          }
        }else{
          this.CurrentuserData = [];
        }
      }, (error) => {
          this.CurrentuserData = [];
      });
    }
  }
  
  // create customer function
  createCustomer(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      userData: (this.userData && this.userData) ? this.userData : ''
    };
    this.pageNotFound = false;
    // calling service
    this.UserService.CertcreateCustomer(cond)
      .subscribe(res => {
        // get financing page dat
        if (res && res.data && res.data.id) {
            console.log(res.data);
            // calling method  for generate token
            this.getecomereceToken();
        } else {
          this.CertToken = '';
        }
      }, (err) => {

      });
  }

  // get ecommerce token
  getecomereceToken(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : ''
    };
    this.pageNotFound = false;
    // calling service
    this.UserService.getEcommToken(cond)
      .subscribe(res => {
        // get financing page dat
        
        if (res && res.data && res.data.response.token) {
          //console.log(res.data.response);
          this.CertToken = res.data.response.token // Set page data
          if(this.CertToken){
              this.UploadCertNow = true;
              GenCert.init(document.getElementById("form_tax_exempt"), {
                  ship_zone: this.userData.state,
                  token:this.CertToken,
                  edit_purchaser: true,
                  submit_to_stack:false,
                  primary_color: '#7D9A3D',  
                  secondary_color: '#7D9A3D',
                  onCertSuccess: function(resp) {
                    console.log(resp);
                    //window.alert("Successful creation"); 
                    //this.toastr.success('Tax Exemption Certificate Submitted Successfully.');
                    //this.getCustomerCertificate();
                    window.location.reload();
                  },
                  onCertFailure: function(resp) {
                    console.log(resp);
                    window.alert("Tax Exemption Certificate Failed."); 
                    //this.toastr.error('Tax Exemption Certificate Failed.');
                  },
                  onUpload: function(resp) {
                    console.log(resp);
                    window.alert("Successfully uploaded"); 
                    //this.toastr.success('Successfully uploaded');

                  }
              });
              
              GenCert.show();
          }
          
        } else {
          this.CertToken = '';
        }
      }, (err) => {

      });
  }
  
  // get ecommerce customer
  getCustomerProfile(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      CertCaptureCustomerID: (this.CurrentuserData && this.CurrentuserData.id) ? this.CurrentuserData.CertCaptureCustomerID : ''
    };
    this.pageNotFound = false;
    // calling service
    this.UserService.getCustomer(cond)
      .subscribe(res => {
        // get financing page dat
        console.log(res);
        if (res && res.data && res.data.response.token) {
          //console.log(res.data.response);
          this.CertToken = res.data.response.token // Set page data
          if(this.CertToken){
          
              GenCert.init(document.getElementById("form_tax_exempt"), {
                  ship_zone: this.userData.state,
                  token:this.CertToken,
                  //edit_purchaser: true,
                  submit_to_stack:false,
                  primary_color: '#7D9A3D',  
                  secondary_color: '#7D9A3D',
                  onCertSuccess: function(resp) {
                    console.log(resp);
                    window.alert("Successful creation"); 
                  },
                  onCertFailure: function(resp) {
                    console.log(resp);
                    window.alert("onCertFailure"); 
                  },
                  onUpload: function(resp) {
                    console.log(resp);
                    window.alert("Successful upload"); 
                  }
              });
              GenCert.show();
          }
          
        } else {
          this.CertToken = '';
        }
      }, (err) => {

      });
  }
  
  // get ecommerce customer certificates
  getCustomerCertificate(): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      CertCaptureCustomerID: (this.CurrentuserData && this.CurrentuserData.id) ? this.CurrentuserData.CertCaptureCustomerID : ''
    };
    this.pageNotFound = false;
    // calling service
    this.UserService.getCustomerCertificates(cond)
      .subscribe(res => {
        // get financing page dat
        console.log('certificates');
        if (res && res.data && res.data.length) {
          console.log(res.data);
          this.CustomerCerticates = res.data;
          
        }else{
            this.SubmitCertificate();
        }
      }, (err) => {

      });
  }
  
  // get ecommerce customer certificate link
  getCustomerCertificate_Link(CertificateID): void {
    // Set conditions
    let cond = {
      cid: this.CID,
      CustomerID: (this.userData && this.userData.id) ? this.userData.id : '',
      CertCaptureCustomerID: (this.CurrentuserData && this.CurrentuserData.id) ? this.CurrentuserData.CertCaptureCustomerID : '',
      CertificateID: CertificateID
    };
    this.pageNotFound = false;
    // calling service
    this.UserService.getCustomerCertificateLink(cond)
      .subscribe(res => {
        // get financing page dat
        console.log('certificates');
        if (res && res.data && res.data.preview_link) {
          console.log(res.data);
          window.open(res.data.preview_link);
          
        } else {
          this.toastr.error('Failed.');
        }
      }, (err) => {

      });
  }

  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }


  // submit certificate
  SubmitCertificate(){

    if(this.CurrentuserData && this.CurrentuserData.CertCaptureUser == 0){
      // calling method  for generate token
      this.createCustomer();
    }else{
      this.getecomereceToken();
    }
    
    
    
  }


}
