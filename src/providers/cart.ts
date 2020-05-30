import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { API, Resource, CartSummary } from './api';
import { AlertController } from 'ionic-angular';

@Injectable()
export class Cart {
    CartSummary?: CartSummary;

    public total: number = 0;
    public count: number = 0;
    public items: { [id: number]: number } = {};
    public list: { item: Resource, count: number }[] = [];
    discount_msg: string;

    DiscountItem?: { item: Resource, count: number, price: number, discountPrice: number };

    private cacheKey = 'cart_items';

    CartChanged = new EventEmitter();

    constructor(
        public storage: Storage,
        public API: API,
        public alertCtrl: AlertController
    ) {
        let self = this;

        this.API.ready(() => {
            self.init().then(() => {
                self.calculate();
            });
        });
    }

    init() {
        let self = this;

        return new Promise((resolve, reject) => {
            self.storage.get(self.cacheKey).then(data => {
                if (typeof data != 'undefined' && data) {
                    self.items = data;
                }

                resolve();
            }).catch(() => {
                resolve();
            });
        });
    }

    clear() {
        let self = this;
        let message = this.alertCtrl.create({
            title: 'Внимание',
            message: "Вы действительно хотите очистить корзину?",
            buttons: [
                {
                    text: 'Отмена',
                    role: 'close'
                },
                {
                    text: 'Очистить',
                    handler: () => {
                        self.clearAll();
                    }
                }
            ]
        });

        message.present();
    }

    clearAll() {
        let self = this;

        this.storage.remove(this.cacheKey).then(() => {
            self.items = {};

            self.calculate();
        });
    }

    getCountItem(id) {
        if (typeof this.items[id] != 'undefined') {
            return this.items[id];
        }

        return 0;
    }

    removeItem(id, deleted = true) {
        if (typeof this.items[id] != 'undefined') {
            let count = this.items[id];

            if (count == 1 && deleted) {
                delete this.items[id];
            } else {
                this.items[id] = this.items[id] - 1;
            }
        }

        this.calculate();
    }

    deleteItem(id, count) {
        let self = this;
        let item = this.API.getItem(id);
        let message = this.alertCtrl.create({
            title: 'Внимание',
            message: "Вы действительно хотите удалить " + item.pagetitle + " (" + count + "шт.)?",
            buttons: [
                {
                    text: 'Отмена',
                    role: 'close'
                },
                {
                    text: 'Удалить',
                    handler: () => {
                        if (typeof self.items[id] != 'undefined') {
                            delete self.items[id];
                        }

                        self.calculate();
                    }
                }
            ]
        });

        message.present();
    }

    async addItem(id, count = 1) {
        if (typeof this.items[id] == 'undefined') {
            this.items[id] = count;
        } else {
            this.items[id] = this.items[id] + count;
        }

        await this.calculate();
    }

    async addDiscountedItem(count = 1) {
        if (this.DiscountItem) {
            this.DiscountItem.count += count;
        }

        await this.calculate();
    }

    private async calculate() {
        let countAll = 0;
        let list: { item: Resource, count: number }[] = [];

        for (let id in this.items) {
            let item = this.API.getItem(id);

            if (!item) {
                delete this.items[id];
                continue;
            }

            let count = this.items[id];

            countAll += count;

            list.push({
                item: item,
                count: count
            });
        }

        this.list = list;
        this.count = countAll;

        this.storage.set(this.cacheKey, this.items);

        await this.getTotal$();

        if (this.CartSummary && this.CartSummary.promo__30pct) {
            const item = this.API.getItem(this.CartSummary.promo__30pct.id);

            if (item) {
                if (!this.DiscountItem || this.DiscountItem.item.id !== item.id) {
                    this.DiscountItem = {
                        item,
                        count: 0,
                        price: 0,
                        discountPrice: 0
                    };
                }

                this.DiscountItem.price = this.CartSummary.promo__30pct.price;
                this.DiscountItem.discountPrice = this.CartSummary.promo__30pct.price__30pct;
            } else {
                this.DiscountItem = null;
            }
        } else {
            this.DiscountItem = null;
        }
    }

    private requests: Promise<CartSummary>[] = [];

    get isCartEmpty(): boolean {
        return this.list.reduce((totalCount, item) => totalCount + item.count, 0) === 0;
    }

    async getTotal$(waitQueue = false) {
        const isOtherWatcher = this.requests.length > 0;

        const order = this.list.map(i => ({ id: i.item.id, count: i.count }));

        if (!this.isCartEmpty && this.DiscountItem && this.DiscountItem.count > 0) {
            order.push({
                id: this.DiscountItem.item.id,
                count: this.DiscountItem.count
            });
        }

        if (order.length > 0) {
            this.requests.push(this.API.getCartSummary(order));
        } else {
            this.requests.push(Promise.resolve({ total_cost: 0, discount_msg: undefined }));
        }

        if (!isOtherWatcher) {
            let result: CartSummary;

            for (let request of this.requests) {
                result = await request;
            }

            if (result) {
                this.CartSummary = result;
                this.total = Math.trunc(result.total_cost);
                this.discount_msg = result.discount_msg;
            } else {
                this.CartSummary = undefined;
                this.total = 0;
                this.discount_msg = undefined;
            }

            this.CartChanged.emit();

            this.requests = [];
        }

        if (waitQueue) {
            for (let request of this.requests) {
                await request;
            }
        }
    }
}
