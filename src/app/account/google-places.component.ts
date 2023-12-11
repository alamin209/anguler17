import { Component, NgZone, ViewChild, EventEmitter, Output, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
declare let google: any;

@Component({
    selector: 'AutocompleteComponent',
    template: `
    <input type="text" class="form-control solid rounded address1" required placeholder="{{'ADDRESS_1' | translate}}" id="Address" #addresstext />
    `,
})
export class AutocompleteComponent implements OnInit, AfterViewInit {
    @Input() adressType: string;
    @Output() setAddress: EventEmitter<any> = new EventEmitter();
    @ViewChild('addresstext') addresstext: any;
    @Input() setValues: string;
    
    autocompleteInput: string;
    queryWait: boolean;
    address: Object;
    establishmentAddress: Object;

    formattedAddress: string;

    phone: string;
    constructor(public zone: NgZone) {
    }

    ngOnInit() {
    
    }

    ngAfterViewInit() {
        this.getPlaceAutocomplete();
       
    }

    private getPlaceAutocomplete() {
   
        const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
            {
                componentRestrictions: { country: ['US','UK','CA','TT'] },
                types: [this.adressType]  // 'establishment' / 'address' / 'geocode'
            });
       
        google.maps.event.addListener(autocomplete, 'place_changed', () => {

            const place = autocomplete.getPlace();
            this.invokeEvent(place);
        });
    }

    invokeEvent(place: Object) {
        this.setAddress.emit(place);
    }
    


}