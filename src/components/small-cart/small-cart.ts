import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Cart } from '../../providers/cart';
import { API } from '../../providers/api';
import { CartPage } from '../../pages/cart/cart';

@Component({
    selector: 'small-cart',
    templateUrl: 'small-cart.html'
})
export class SmallCart {
    
    public ready : boolean = false;
    public data : any = false;
    public _backText : string = 'Назад';
    
    @Input()
    set backText(text : any) {
        this._backText = text;
    }
    
    constructor(
        public navCtrl: NavController,
        public Cart : Cart,
        public API : API
    ) {
        
    }
    
    openCart() {
        if(this.API.data) {
            this.navCtrl.push(CartPage, {
                title : this._backText
            });
        }
    }
}
