import { Component, OnInit, ViewChild, TemplateRef, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BsModalService, BsModalRef,ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { VideoService } from '../../services/video/video.service';
import { UserService } from '../../services/auth/user.service'
import { TranslateService } from '@ngx-translate/core';

// Declear jquery 
declare var jQuery: any;

@Component({
  selector: 'app-upload-media',
  // inputs: [ 'memberUpload' ],
  templateUrl: './upload-media.component.html',
  styleUrls: ['./upload-media.component.sass']
})
export class UploadMediaComponent implements OnInit {

  @Input()
  memberUpload: string;

  @Output()
  videoForm;
  messageEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  CID: number = environment.config.CID;
  url: string = environment.config.API_URL;
  userData: any;
  UserToken: any;
  tags: any;
  TagModel: any;
  myVideos: any;
  VideoData: any;
  VideoTitle: any; 
  VideoDuration: any; 
  videoFile: any; 
  videoURL: any; 
  ImageData: any;
  imageFile: any; 
  imageURL: any; 
  _Uploading: any; 
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;
  modalRef: BsModalRef;
  private target: any;
  formData:any = {
    title:'',
    tags: '',
    categories:''
  }
  categories = [];
  channels = [];
  
  @ViewChild('template', {}) template: ModalDirective;
  constructor(
    private modalService: BsModalService,
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private VideoService: VideoService,
    private UserService: UserService
  ) {
    // Set translate language
    translate.setDefaultLang('en');
    
   }

  ngOnInit() {
    // brodcast data for login user
    this.userData = '';
    this.UserService.setUserDataList();
    this.UserService.castUserData.subscribe(userData => {
      this.userData = userData;
      // get user token
      this.UserToken = localStorage.getItem('token');
    });

    this.tags = [];
    //this.imageFile = '';
    this.imageURL = '';
    this.videoURL = '';
    this._Uploading = false;

    this.videoForm = this.formBuilder.group({
      title: ['', Validators.required],
      tags: [''],
      categories: ['', Validators.required],
      Channel_ID: [''],
      video_description: [''],
      //video_thumb: [''],
      //Videofile: [''],
      video_duration: [''],
      id: ['']
    }, {
      
    });
    
    this.getVideoCategories();
    this.getVideoChannels();
  }

  getVideoCategories() {
    let cond = {
      cid: this.CID
    };
    this.VideoService.getVideoCategories(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          this.categories = res.data;
        }
      }, (err) => {

    });
  
  }
  
  getVideoChannels() {
    let cond = {
      cid: this.CID
    };
    this.VideoService.getVideoChannels(cond)
      .subscribe(res => {
        if (res && res.data && res.data.length) {
          this.channels = res.data;
        }
      }, (err) => {

    });
  
  }
  
  
  _UploadVideo() {
    jQuery('#media_up_btn').click();
  }
  
  onAdd(item) {
    this.tags.push(item.value);
  }

  
  onSubmit(videoData) {
    //console.log(this.userData);return;

    this.videoForm.controls['Channel_ID'].setErrors(null);
    this.videoForm.controls['video_description'].setErrors(null);
    this.videoForm.controls['video_duration'].setErrors(null);
    this.videoForm.controls['tags'].setErrors(null);
    this.markFormGroupDirtied(this.videoForm);

    if (this.videoForm.valid) {

      this._Uploading = true;
      videoData['CID'] = this.CID;
      videoData['authToken'] = localStorage.getItem("token");
      videoData['VideoData'] = this.VideoData;
      videoData['ImageData'] = this.ImageData;
      videoData['tags'] = this.tags;
      videoData['video_duration'] = jQuery('#video_duration').val();
      if(typeof this.memberUpload != "undefined" && this.memberUpload == '1'){
        videoData['userId'] = this.userData.id;
      } else {
        videoData['userId'] = this.userData.id;
      }
      videoData['userName'] = this.userData.first_name+' '+this.userData.last_name;
      videoData["categoryName"] = '';
      this.categories.map(function(v){
        if(v.ID = videoData.categories){
          videoData["categoryName"] = v.name;
        }
      });
      this.VideoService.uploadVideo(videoData)
        .subscribe(
          (res) => {
            //this._Uploading = false;
            this.videoForm.reset();
            this.toastr.success('Uploaded Successfully.', 'Success!');
            // redirect on custome thank you page
            //window.location.reload();
            this.changeRouter('member/products?type=Videos');
            //this.changeRouter('thank-you/customer');
          },
          (error: any) => {
            if (error.error.error) {
              this._Uploading = false;
              this.toastr.error(error.error.error, 'Error!');
            }
          }
        );
      
    } else {
    }
  }
  private markFormGroupDirtied(formGroup: FormGroup) {
    (<any>Object).values(formGroup.controls).forEach(control => {
      control.markAsDirty();

      if (control.controls) {
        this.markFormGroupDirtied(control);
      }
    });
  }
  // redirect to page according to url
  changeRouter(slug): void {
    this.router.navigateByUrl(slug, { replaceUrl: true });
  }

  processFile(files: any) {
    if (files.length === 0)
      return;
 
    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error('Only images are supported.', 'Error!');
      return;
    }
    var reader = new FileReader();
    this.imageFile = files[0];
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
      this.imageURL = reader.result; 
      this.ImageData = {
        filename: this.imageFile.name,
        filesize: this.imageFile.size,
        filetype: this.imageFile.type,
        value: reader.result
      };
    }
  }

  processVideo(files: any) {
    if (files.length === 0)
      return;
 
    var mimeType = files[0].type;
    if (mimeType.match(/video\/*/) == null) {
      this.toastr.error('Only Videos are supported.', 'Error!');
      return;
    }
    var reader = new FileReader();
    this.videoFile = files[0];
    this.getFileInfo(files);
    console.log(this.videoFile);
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
      this.videoURL = reader.result; 
      //console.log(this.videoURL);
      this.VideoData = {
        filename: this.videoFile.name,
        filesize: this.videoFile.size,
        filetype: this.videoFile.type,
        value: reader.result
      };
      this.VideoTitle = this.removeExtension(this.videoFile.name);
      this.videoForm.patchValue({
        title: this.VideoTitle
      });
      this.template.show();
    }

    

  }

  
  getFileInfo(files) {
    
    window.URL;
    var video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function() {
      window.URL.revokeObjectURL(video.src);
      var duration = video.duration;
      jQuery('#video_duration').val(duration);
      //this.setDuration(duration);
    }
    
    video.src = URL.createObjectURL(files[0]);

  }


  setDuration(duration) {
    this.VideoDuration = duration;
  }
  
  removeExtension(filename) {
    
    var lastDotPosition = filename.lastIndexOf(".");
    if (lastDotPosition === -1) return filename;
    else return filename.substr(0, lastDotPosition);
  }
  
  editVideo(id){
    let cond = {
      cid: this.CID,
      recId: id
    };
    this.VideoService.getVideoDetailsSingle(cond).subscribe(res => {
      if (res && res.data && res.data.length) {
        this.videoForm.patchValue({
          video_duration: res.data[0].Video_Time,
          title: res.data[0].Video_Title,
          categories: res.data[0].CategoryId,
          Channel_ID: res.data[0].ChannelId,
          video_description: res.data[0].Video_Description,
          tags: res.data[0].Tags,
          id: res.data[0].ID
        });
        this.template.show();
      }
    }, (err) => {});    
  }
  

}
