import { Pipe, PipeTransform } from '@angular/core';
import { dateToUIString } from '../stringUtils';

@Pipe({
  name: 'tripsDateTime'
})
export class TripsDateTimePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value instanceof Date) {
      return dateToUIString(value, true);
    } else if (typeof value == "string") {
      let d = new Date(value);
      return dateToUIString(d, true);
    }

    return value;
  }

}
