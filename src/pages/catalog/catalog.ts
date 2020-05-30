import { Component } from '@angular/core';
import { NavController, ViewController, NavParams } from 'ionic-angular';
import { API } from '../../providers/api';
import { Cart } from '../../providers/cart';
import { CatalogDetailPage } from '../cartDetail/cartDetail';

@Component({
    selector: 'page-catalog',
    templateUrl: 'catalog.html'
})
export class CatalogPage {
    public resourceShow = 0;
    public data: any = false;
    public sort: any = [
        {
            title: 'По цене',
            slug: 'tv_price',
            selected: true
        },
        {
            title: 'По популярности',
            slug: 'id',
            selected: false
        }
    ];
    public activeSort = 'tv_price';

    constructor(
        public navCtrl: NavController,
        public API: API,
        public Cart: Cart,
        public viewCtrl: ViewController,
        public navParams: NavParams
    ) {
        let id = this.navParams.get('catalog');
        let self = this;

        setTimeout(() => {
            self.loadData(id);
        }, 10);
    }

    catalogItem(catalogItemId,pagetitle) {
        this.navCtrl.push(CatalogDetailPage, {
            "catalogItem": catalogItemId,
            "pagetitle":pagetitle
        });
    }

    loadData(id) {
        let self = this;

        this.API.getCatalogById(id).then((catalog: any) => {
            catalog.resources = catalog.resources.map((a, index) => {
                a.sortIndex = index;
                return a;
            });

            self.data = catalog;
        });
    }

    getActiveSort() {
        return this.activeSort;
    }

    setSort(slug) {
        this.activeSort = slug;

        this.sort = this.sort.map(a => {
            a.selected = a.slug == slug;

            return a;
        });
    }

    ionViewWillEnter() {
        this.viewCtrl.setBackButtonText('Меню');
    }
}
