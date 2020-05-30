import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class City {

    private cacheKey = 'city';

    public list : any = [
        {
            index : 0,
            active : true,
            title : 'г. Кандалакша',
            phone : '79533074747'
        },
        {
            index : 1,
            active : false,
            title : 'г. Полярные Зори',
            phone : '79113005535'
        }
    ];
    public activeItem : any;

    private active = 0;

    constructor(
        public storage : Storage
    ) {
        let self = this;

        this.activeItem = this.getActive();

        this.storage.get(this.cacheKey).then(a => {
            if(typeof a != 'undefined' && a) {
                self.setActive(a);
            }
        });
    }

    setActive(index) {
        let list = this.list;

        list[this.active].active = false;
        list[index].active = true;

        this.list = list;
        this.active = index;

        this.activeItem = this.getActive();

        this.storage.set(this.cacheKey, this.active);
    }

    getActive() {
        return this.list[this.active];
    }

}
