import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: "sortCatalog",
    pure: false
})
@Injectable()
export class ArraySortPipe implements PipeTransform {
    
    transform(array: Array<string>, args : string, direction : number = 1): Array<string> {
        let field = args;
        
        array.sort((a: any, b: any) => {
            if (a.sortIndex < b.sortIndex) {
                return -1;
            } else if (a.sortIndex > b.sortIndex) {
                return 1;
            } else {
                return 0;
            }
        });
        
        array.sort((a: any, b: any) => {
            if (a[field] < b[field]) {
                return -1*direction;
            } else if (a[field] > b[field]) {
                return 1*direction;
            } else {
                return 0;
            }
        });
        
        return array;
    }
    
    
}