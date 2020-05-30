import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage'
import { HttpModule } from '@angular/http';
import { ElasticModule } from 'angular2-elastic';
import { TextMaskModule } from 'angular2-text-mask';

import { API } from '../providers/api';
import { Cart } from '../providers/cart';
import { City } from '../providers/city';

import { SmallCart } from '../components/small-cart/small-cart';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { CatalogPage } from '../pages/catalog/catalog';
import { CartPage } from '../pages/cart/cart';
import { AboutPage } from '../pages/about/about';
import { OrderPage } from '../pages/order/order';
import { HistoryPage } from '../pages/history/history';
import { CatalogDetailPage } from '../pages/cartDetail/cartDetail';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ArraySortPipe } from '../pipes/ArraySortPipe';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';


import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';

import { AngularFireDatabase } from 'angularfire2/database';

const config = {
  apiKey: "AIzaSyC7dMCQBFds3FCWWbO1Qgg_mF1RXzqwg2g",
  authDomain: "japancity-a22bc.firebaseapp.com",
  databaseURL: "https://japancity-a22bc.firebaseio.com",
  projectId: "japancity-a22bc",
  storageBucket: "japancity-a22bc.appspot.com",
  messagingSenderId: "163960703231"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    CatalogPage,
    SmallCart,
    ArraySortPipe,
    CartPage,
    AboutPage,
    OrderPage,
    CatalogDetailPage,
    HistoryPage
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    IonicModule.forRoot(MyApp, {
      platforms: {
        ios: {
          statusbarPadding: false
        }
      }
    }),
    IonicStorageModule.forRoot(),
    HttpModule,
    ElasticModule,
    TextMaskModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    CatalogPage,
    SmallCart,
    CartPage,
    AboutPage,
    OrderPage,
    CatalogDetailPage,
    HistoryPage
  ],
  providers: [
    API,
    Cart,
    City,
    AngularFireDatabase,
    InAppBrowser,
    UniqueDeviceID,
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
