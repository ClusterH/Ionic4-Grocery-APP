import { Component } from '@angular/core';
import { NavController, ViewController, NavParams, AlertController, ToastController, Platform } from 'ionic-angular';
import { API } from '../../providers/api';
import { Cart } from '../../providers/cart';
import { City } from '../../providers/city';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
import { TinkoffMerchantAPI } from '../../tinkoff-merchant-api-3.1.0';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireDatabase } from 'angularfire2/database';
import Tinkoff from 'react-tinkoff-pay'

declare var cordova: any;
@Component({
    selector: 'page-order',
    templateUrl: 'order.html'
})
export class OrderPage {

    url: any;
    onlinePaymentFlag = false;

    private cacheKey: string = 'order_info';
    private cacheHistoryKey: string = 'order_history';

    public mask = ['+', '7', ' ', '(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
    public data: any = {
        name: {
            field: 'Имя',
            required: false,
            value: ''
        },
        noPerson: {
            field: 'Имя',
            required: false,
            value: ''
        },
        phone: {
            field: 'Телефон',
            required: true,
            value: ''
        },
        city: {
            field: 'Город',
            required: true,
            value: 0
        },
        street: {
            field: 'Улица',
            required: true,
            value: ''
        },
        house: {
            field: 'Дом',
            required: false,
            value: ''
        },
        enter: {
            field: 'Подъезд',
            required: false,
            value: ''
        },
        floor: {
            field: 'Этаж',
            required: false,
            value: ''
        },
        flat: {
            field: 'Квартира/Офис',
            required: false,
            value: ''
        },
        pay: {
            field: 'Способ оплаты',
            required: true,
            value: 'cash'
        },
        change: {
            field: 'Нужна сдача с',
            required: false,
            value: '5000'
        },
        comment: {
            field: 'Комментарий',
            required: false,
            value: ''
        }
    };

    public bankApi;
    public proDisType;

    constructor(
        public navCtrl: NavController,
        public API: API,
        public Cart: Cart,
        public City: City,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        private alertCtrl: AlertController,
        public toastController: ToastController,
        private af: AngularFireDatabase,
        private storage: Storage,
        public platform: Platform,
        private iab: InAppBrowser,
        sanitize: DomSanitizer
    ) {
        this.data.city.value = this.City.activeItem.index;
        this.url = sanitize.bypassSecurityTrustResourceUrl("https://securepay.tinkoff.ru/iztuJP");
        this.bankApi = new TinkoffMerchantAPI('1549291571034', 'kr1kpvzmt65hsa5e');
    }

    ionViewWillEnter() {
        this.viewCtrl.setBackButtonText('Корзина');
        this.data.pay.value = 'onlinePayment';
    }

    ionViewWillLeave() {
        this.saveOrderInfo();
    }

    async payment(order) {
        await this.bankApi.init(order).then(async res => {
            res = JSON.parse(JSON.stringify(res))

            if (!res['Success']) {
                const toast = await this.toastController.create({
                    message: res['Details'],
                    duration: 2000
                });
                toast.present();
            } else {
                const browser = this.iab.create(res['PaymentURL'], '_self');

                browser.on('loadstop').subscribe(event => {
                    this.orderAPICall(order);
                });
            }

        }).catch(err => {
            console.log(err.stack)
        });
    }

    saveOrderInfo() {
        this.storage.set(this.cacheKey, this.data);
    }

    deviceId;
    orderAmount;
    subscribe;
    flag = true;
    public getDeviceIdDataById(callback) {
        this.storage.get('deviceId').then(value => {
            this.deviceId = value;
            this.af.object('/DeviceCollection/' + value).snapshotChanges()
                .subscribe(async actions => {
                    if (this.flag) {
                        this.flag = false;
                        var data = JSON.parse(JSON.stringify(actions));
                        if (data['payload'] == null || data['payload']['orderAmount'] == 0) {
                            callback(true)
                        } else {
                            this.orderAmount = data['payload']['orderAmount'];
                            callback(false)
                        }

                    }

                })

        })
    }

    setFlag() {

    }
    send() {
        if (!this._validate()) {
            let message = this.alertCtrl.create({
                title: 'Пожалуйста!',
                subTitle: 'Заполните обязательные поля',
                buttons: ['ОК']
            });

            message.present();
            return;
        }

        let self = this;
        let order: any = {};

        for (let prop in this.data) {
            let key = prop;
            let value = this.data[prop];

            if (key == 'city') {
                order[value.field] = this.City.list[value.value].title;
            } else if (key == 'pay') {
                order[value.field] = value.value == 'cash' ? 'Наличные' : 'Картой курьеру';
            } else {
                order[value.field] = value.value;
            }
        }

        order.cart = {};

        this.getDeviceIdDataById((flag) => {
            order.cart.total = this.Cart.total;
            if (!flag) {
                this.checkOrderAmount(order.cart.total, async (chkFlg) => {

                    if (this.proDisType == "roll" || this.proDisType == "csr" || this.proDisType == "cr") {
                        var rollId;
                        if (this.proDisType == "roll") {
                            rollId = 104;
                        } else if (this.proDisType == "csr") {
                            rollId = 105;
                        } else if (this.proDisType == "cr") {
                            rollId = 106;
                        }
                        await this.Cart.addItem(rollId);
                        this.af.object('/DeviceCollection/' + this.deviceId)
                            .update({ "orderAmount": order.cart.total }).then(() => {
                                if (chkFlg) {
                                    order.cart.total = this.Cart.total;
                                }
                                this.subPayment(order, chkFlg);
                            });

                    } else {
                        this.subPayment(order, chkFlg);
                    }

                })
            } else {
                this.subPayment(order, flag);
            }

        })

    }

    subPayment(order, flag) {
        this.Cart.list.map(a => {
            let item: any = {};
            item.name = a.item.pagetitle;
            item.length = a.count;
            item.price = (this.proDisType == 'discount') ? (a.item.tv_price - ((a.item.tv_price * 10) / 100)) : a.item.tv_price;
            item.weight = a.item.tv_weight;
            item.img = this.API.server + a.item.tv_image;

            if (a.count) {
                order.cart[a.item.id] = item;
            }
        });

        if (this.Cart.DiscountItem && this.Cart.DiscountItem.count > 0) {
            order.cart[this.Cart.DiscountItem.item.id] = {
                name: this.Cart.DiscountItem.item.pagetitle,
                length: this.Cart.DiscountItem.count,
                price: this.Cart.DiscountItem.discountPrice,
                weight: this.Cart.DiscountItem.item.tv_weight,
                img: this.API.server + this.Cart.DiscountItem.item.tv_image
            };
        }

        if (flag) {
            order.cart.total = order.cart.total - 350;
        }


        if (this.data.pay.value == "onlinePayment") {
            var object = {
                Amount: "",
                OrderId: (Date.now() + Math.random()).toString().substr(2, 6),
                DATA: {
                    Phone: this.data.phone.value
                },
                Receipt: {
                    Phone: this.data.phone.value,
                    Taxation: 'osn',
                    Items: []
                }
            }

            var a = "0";
            var totalAmount = 0;
            Object.keys(order['cart']).forEach((k, i) => {
                if (order['cart'][k]['name'] != null) {
                    var amount = 0;

                    if (a == "0" && flag && order['cart'][k]['name'] == "Запеченный ролл с крабом" && this.proDisType == "roll") {
                        a = "1";
                        amount = (order['cart'][k]['price'] * order['cart'][k]['length']) - 350;
                    } else if (this.proDisType == "discount") {
                        amount = (order['cart'][k]['price'] * order['cart'][k]['length'])
                    } else {
                        amount = (order['cart'][k]['price'] * order['cart'][k]['length']);
                    }
                    totalAmount += (amount)*100
                    object.Receipt.Items.push({
                        Name: order['cart'][k]['name'],
                        Price: order['cart'][k]['price'],
                        Quantity: order['cart'][k]['length'],
                        Amount: amount * 100,
                        Tax: 'vat18'
                    })


                }
                object.Amount = (totalAmount).toString()
            });

            this.payment(object);
        } else {
            this.orderAPICall(order);
        }

    }

    async checkOrderAmount(total, callback) {
        if (total > 1600 && this.orderAmount < 1600) {
            this.optionSelect((t) => {
                callback(true);
            });
        } else if (this.orderAmount > 1600 && total > 2450) {
            this.optionSelect((t) => {
                callback(true);
            });
        } else if (this.orderAmount > 2450 && total > 2900) {
            this.optionSelect((t) => {
                callback(true);
            });
        } else if (total > 800 && (new Date()).getHours() == 21) {
            this.optionSelect((t) => {
                callback(true);
            });
        }
        else {
            callback(false);
        }
    }

    optionSelect(callback) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        var d = new Date();
        var dayName = days[d.getDay()];
        var input = []
        if (dayName != 'Saturday' && dayName != 'Sunday' && d.getHours() >= 11 && d.getHours() <= 15) {
            input = [{
                type: 'radio',
                label: '10% Discount',
                value: 'discount'
            }]
        } else if (d.getHours() != 21) {
            input = [{
                type: 'radio',
                label: '10% Discount',
                value: 'discount'
            },
            {
                type: 'radio',
                label: 'Free Roll',
                value: 'roll'
            }]
        } else if (d.getHours() == 21) {
            input = [{
                type: 'radio',
                label: 'Cheese spicy roll',
                value: 'csr'
            },
            {
                type: 'radio',
                label: 'Chicken roll',
                value: 'cr'
            }]
        } else {
            input = [{
                type: 'radio',
                label: '10% Discount',
                value: 'discount'
            }]
        }
        let alert = this.alertCtrl.create({
            title: 'You want as a gift...',
            inputs: input,
            buttons: [
                {
                    text: 'OK',
                    handler: (data) => {
                        this.proDisType = data;
                        callback(true)
                    }
                }
            ]
        });
        alert.present();
    }

    orderAPICall(order) {
        this.API.sendOrder(order).then(async result => {

            const toast = await this.toastController.create({
                message: 'Ваш заказ успешно отправлен. В ближайшее время мы вам позвоним.',
                duration: 2000
            });
            toast.present();

            var promotionItem = localStorage.getItem("promotionItem");

            if (typeof promotionItem == 'undefined' || promotionItem == null || promotionItem == '') {
                localStorage.setItem("promotionItem", 'true');
                this.Cart.addItem(104);
            }

            this.navCtrl.setRoot(HomePage);

            this.writeHistory(order);
        });
    }

    writeHistory(order) {

        let self = this;

        this.getHistory().then((list: any) => {
            order.date = +(new Date());

            list.push(order);

            self.storage.set(self.cacheHistoryKey, list);

            self.Cart.clearAll();
        });
    }

    getHistory() {
        let self = this;

        return new Promise((resolve, reject) => {
            self.storage.get(self.cacheHistoryKey).then(value => {
                if (!value) {
                    resolve([]);
                    return;
                }

                resolve(value);
            }).catch(() => {
                resolve([]);
            });
        });
    }

    _validate() {
        let result = true;

        for (let prop in this.data) {
            if (this.data[prop].required && this.data[prop].value.length == 0) {
                result = false;
            }
        }

        return result;
    }
}
