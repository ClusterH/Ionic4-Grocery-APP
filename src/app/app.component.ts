import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, ActionSheetController } from 'ionic-angular';


import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { AboutPage } from '../pages/about/about';
import { HistoryPage } from '../pages/history/history';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { City } from '../providers/city';
import { Cart } from '../providers/cart';
import { AngularFirestore } from 'angularfire2/firestore';

import { AngularFireDatabase } from 'angularfire2/database';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { Storage } from '@ionic/storage';
declare var window: any;

@Component({
    templateUrl: 'app.html',
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;

    pages: Array<{ title: string, component: any, icon: any }>;

    constructor(
        private alertCtrl: AlertController,
        private actionSheetCtrl: ActionSheetController,
        public platform: Platform,
        public statusBar: StatusBar,
        public splashScreen: SplashScreen,
        public City: City,
        public storage: Storage,
        private af: AngularFireDatabase,
        public firestore: AngularFirestore,
        private uniqueDeviceID: UniqueDeviceID,
        public Cart: Cart,
    ) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            {
                title: 'Меню',
                icon: 'icon-menu',
                component: HomePage
            },
            {
                title: 'Акции',
                icon: 'icon-sales',
                component: ListPage
            },
            {
                title: 'История заказов',
                icon: 'icon-history',
                component: HistoryPage
            },
            {
                title: 'О компании',
                icon: 'icon-about',
                component: AboutPage
            }
        ];
    }

    selectCity() {
        let self = this;
        let list = this.City.list;

        let inputs = list.map(a => {
            return {
                text: a.title,
                handler: () => {
                    self.City.setActive(a.index)
                }
            };
        });

        inputs.push({
            text: 'Отмена',
            role: 'cancel'
        });

        let message = this.actionSheetCtrl.create({
            title: 'Выберите город',
            buttons: inputs
        });

        message.present();
    }

    callOrder() {
        let active = this.City.getActive();
        let phone = '+' + active.phone;
        window.open('tel:' + phone);
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.setPush()
        });
    }

    createTask(value) {
        return new Promise<any>((resolve, reject) => {
            let currentUser = this.firestore.createId();
            this.firestore.collection('users').add({
                title: value.title,
                description: value.description
            })
                .then(
                    res => resolve(res),
                    err => reject(err)
                )
        })
    }

    getDeviceIdDataById(id) {
        this.af.object('/DeviceCollection/' + id).snapshotChanges()
            .subscribe(async actions => {
                var data = JSON.parse(JSON.stringify(actions));
                if (data['payload'] == null || data['payload']['orderAmount'] == 0) {
                    await this.addTodo(id);
                    this.storage.get('deviceType').then(async (filename) => {
                        if (filename == null) {
                            await this.Cart.addItem(104);
                            this.storage.set("deviceType", "New");
                            this.storage.set("deviceId", id);
                        }
                    });
                } else {
                    this.storage.set("deviceId", id);
                    this.storage.set("deviceType", "Old");
                    this.storage.set("orderAmount", actions.payload['orderAmount']);
                }
            });
    }

    addTodo(id: string): void {
        this.af.object('/DeviceCollection/' + id).set({
            "orderAmount": 0
        });
    }

    updateTodo2(todo: any, newValue: string, id): void {
        this.af.object('/DeviceCollection/' + id)
            .update({ "content": "newValue123", "done": "todo.done", "done1": "todo.done" });
    }

    deleteTodo(todo: any): void {
        this.af.object('/DeviceCollection/' + todo.$key).remove();
    }

    async chkUserIspresent(uuid) {
        await this.getDeviceIdDataById(uuid);
    }

    async setPush() {
        this.chkUserIspresent('i7YWR4FypnvfJ3tx3lT3');
    }

    openPage(page) {
        this.nav.setRoot(page.component);
    }
}
