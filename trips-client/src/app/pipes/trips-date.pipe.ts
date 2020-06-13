import { Pipe, PipeTransform } from '@angular/core';
import { dateToUIString } from '../stringUtils';

@Pipe({
  name: 'tripsDate'
})
export class TripsDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value instanceof Date) {
      return dateToUIString(value, false);
    } else if (typeof value == "string") {
      let d = new Date(value);
      return dateToUIString(d, false);
    }

    return value;
  }

}
