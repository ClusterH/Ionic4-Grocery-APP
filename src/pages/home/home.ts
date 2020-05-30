import { Component } from '@angular/core';
import { NavController, LoadingController, Platform, AlertController, ToastController } from 'ionic-angular';
import { CatalogPage } from '../../pages/catalog/catalog';
import { API } from '../../providers/api';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {

    public ready: boolean = false;
    public data: any = [];
    bankApi
    constructor(
        public navCtrl: NavController,
        public API: API,
        public loadingCtrl: LoadingController,
        public platform: Platform,
        public toastController: ToastController,
        public alertCtrl: AlertController
    ) {
        this.loadData();

        platform.ready().then(() => { 
        }); 
      
    }

 


    private async presentToast(message) {
        const toast = await this.toastController.create({
            message,
            duration: 3000
        });
        toast.present();
    }

    openCatalog(catalog: any) {
        this.navCtrl.push(CatalogPage, {
            catalog: catalog
        });
    }
 

    loadData() {
        this.ready = false;
        let self = this;

        this.API.getCatalog().then(data => {
            self.ready = true;
            self.data = data;
        });
    }
}
