import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, AlertController } from 'ionic-angular';
import { API } from '../../providers/api';
import { Cart } from '../../providers/cart';
import { City } from '../../providers/city';
import { Storage } from '@ionic/storage';

import { CartPage } from '../cart/cart';

@Component({
    selector : 'page-history',
    templateUrl : 'history.html'
})
export class HistoryPage {

    private cacheHistoryKey : string = 'order_history';

    public list = [];

    constructor(
        public navCtrl: NavController,
        public API : API,
        public Cart : Cart,
        public City : City,
        public viewCtrl : ViewController,
        public navParams : NavParams,
        private alertCtrl : AlertController,
        private storage : Storage
    ) {
        this.loadData();
    }

    loadData() {
        let self = this;

        this.storage.get(this.cacheHistoryKey).then(value => {
            if(!value) {
                return;
            }

            self.list = value.map(a => {
                if(typeof a.date == 'undefined') {
                    a.date = +(new Date);
                }

                a.items = [];

                let prop : any;

                for(prop in a.cart) {
                    if(!isNaN(parseInt(prop))) {
                        let its = a.cart[prop];

                        its.id = parseInt(prop);

                        a.items.push(its);
                    }
                }

                return a;
            }).reverse();
        });
    }

    duplicateOrder(item) {
        let self = this;

        item.items.map(a => {
            self.Cart.addItem(a.id, a.length);
            return a;
        });

        this.navCtrl.push(CartPage);
    }

}
