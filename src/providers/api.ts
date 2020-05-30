import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';

export interface Category {
    id: number;
    introtext: string;
    pagetitle: string;
    parent: number;
    resources: Resource[];
}

export interface Resource {
    description: string;
    id: number;
    introtext: string;
    pagetitle: string;
    parent: number;
    tv_hit: boolean;
    tv_image: string;
    tv_price: number;
    tv_weight: string;
}

export interface CartSummary {
    total_cost: number;
    discount_msg: string;
    promo__30pct?: {
        id: number;
        price: number;
        price__30pct: number;
    }
}

@Injectable()
export class API {

    public readonly server = 'https://pz.japan-city.ru/';
    public readonly orderServerUrl = 'https://japan-city.ru/appMail.php';

    public data : any = false;
    private items : any = {};

    private callReady = [];

    constructor(
        public storage : Storage,
        public http : Http,
        public splashScreen: SplashScreen
    ) {

    }

    getPromo() {
        let self = this;
        let url = this.server+'app-shares';

        return new Promise((resolve, reject) => {
            self.callAPI(url, true).then(data => {
                resolve(data);
            }).catch(() => {
                reject();
            });
        });
    }

    ready(callback) {
        if(this.data) {
            callback();
            return;
        }

        this.callReady.push(callback);
    }

    onReady() {
        this.callReady.map(a => {
            a();
        });
        this.splashScreen.hide();
    }

    getCatalogById(id) {
        let self = this;

        return new Promise((resolve, reject) => {
            self.getCatalog().then((data : any) => {
                let result = false;

                data.map(a => {
                    if(a.id == id) {
                        result = a;
                    }
                });

                if(result) {
                    resolve(result);
                    return;
                }

                reject();
            });
        });
    }

    getCatalog(): Promise<Category[]> {
        let self = this;
        let url = this.server+'app-products';

        return new Promise((resolve, reject) => {

            if(self.data) {
                resolve(self.data);
                return;
            }

            self.callAPI(url, true).then((data : any) => {
                let result = [];

                for(let prop in data) {
                    let resources = data[prop].resources;
                    data[prop].resources = [];

                    for(let propRes in resources) {
                        self.items[resources[propRes].id] = resources[propRes];
                        data[prop].resources.push(resources[propRes]);
                    }

                    result.push(data[prop]);
                }

                self.data = result;

                resolve(result);

                self.onReady();
            }).catch(() => {
                reject();
            });
        });
    }

    getItem(id) {
        if(typeof this.items[id] == 'undefined') {
            return false;
        }

        return this.items[id];
    }

    sendOrder(resources) {
        return this.callAPI(this.orderServerUrl, false, 'post', resources);
    }

    async callAPI(url: string, json = false, method = 'get', data: any = ""): Promise<any> {
        let request: Promise<Response>;

        switch(method) {
            case 'get':
                request = this.http.get(url, { withCredentials : false }).toPromise();
                break;
            case 'post':
                let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
                let options = new RequestOptions({ headers: headers, method: "post", withCredentials : false });

                request = this.http.post(url, data, options).toPromise();
                break;
        }

        const response = await request;

        if (json) {
            return response.json();
        }
    }

    getCartSummary(order: { id: number, count: number }[]): Promise<CartSummary> {
        return this.callAPI(this.server + `app-cart?products=${order.map(item => `${item.id}:${item.count}`).join(',')}`, true);
    }
}
