import { Component, ViewChild, OnDestroy } from '@angular/core';
import { ViewController, NavController, NavParams, LoadingController, Content } from 'ionic-angular';
import { API } from '../../providers/api';
import { Cart } from '../../providers/cart';
import { OrderPage } from '../order/order';
import { Subject } from 'rxjs';


@Component({
    selector: 'page-cart',
    templateUrl: 'cart.html',

})
export class CartPage implements OnDestroy {
    @ViewChild(Content) Content: Content;

    readonly minimalOrderPrice = 400;

    public ready : boolean = false;

    private backTitle = 'Назад';

    private readonly _destroyed$ = new Subject();

    constructor(
        public viewCtrl : ViewController,
        public navCtrl : NavController,
        public navParams : NavParams,
        public API : API,
        public Cart : Cart,
        public loadingCtrl: LoadingController
    ) {
        let self = this;

        this.backTitle = this.navParams.get('title');

        this.API.ready(() => {
            self.ready = true;
        });

        this.Cart.CartChanged.takeUntil(this._destroyed$).subscribe(() => this.fixContentSize());
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.complete();
    }

    timeout$(duration: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    async openOrder() {
        const minimumDuration = this.timeout$(2000);
        const loading = this.loadingCtrl.create();
        loading.present();

        try {
            await this.Cart.getTotal$(true);
            await minimumDuration;

            if (this.Cart.total > this.minimalOrderPrice) {
                this.navCtrl.push(OrderPage);
            }
        }
        finally {
            loading.dismiss();
        }
    }

    ionViewWillEnter() {
        this.viewCtrl.setBackButtonText(this.backTitle);
    }

    get canOpenOrder(): boolean {
        return this.Cart.total >= this.minimalOrderPrice;
    }

    fixContentSize() {
      if (this.Content) {
        this.Content.resize();
      }
    }
}
