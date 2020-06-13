import { Pipe, PipeTransform } from '@angular/core';
import { dateToUIString } from '../stringUtils';

@Pipe({
  name: 'adaptiveDate'
})
export class AdaptiveDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value instanceof Date) {
      return this.transformCore(value);
    } else if (typeof value == "string") {
      let d = new Date(value);
      return this.transformCore(d);
    }

    return value;
  }

  private transformCore(date: Date): string {
    let now = new Date();
    let twelveHoursAgo = new Date(now);
    twelveHoursAgo.setHours(now.getHours() - 12);
    if (
         ((date.getFullYear() == now.getFullYear())
          && (date.getMonth() == now.getMonth())
          && (date.getDate() == now.getDate())
         ) || (
           date >= twelveHoursAgo
         )
       ) {
      return dateToUIString(date, true);
    } else {
      return dateToUIString(date, false);
    }
  }
}
