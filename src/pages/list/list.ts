import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { API } from '../../providers/api';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html'
})
export class ListPage {
    
    public data : any = false;

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public API: API
    ) {
        this.loadData();
    }
    
    loadData() {
        let self = this;
        
        this.API.getPromo().then(data => {
            self.data = data;
        });
    }
    
}
