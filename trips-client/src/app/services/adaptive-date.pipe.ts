import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'adaptiveDate'
})
export class AdaptiveDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    let isAdaptive = true;
    if (args.length > 0) {
      isAdaptive=!!args[0];
    }
    
    if (value instanceof Date) {
      return this.transformCore(value, isAdaptive);
    } else if (typeof value == "string") {
      let d = new Date(value);
      return this.transformCore(d, isAdaptive);
    }

    return value;
  }

  private transformCore(date: Date, adaptive: boolean): string {
    let today = new Date();
    if ((!adaptive)
          || ((date.getFullYear() == today.getFullYear())
              && (date.getMonth() == today.getMonth())
              && (date.getDate() == today.getDate()))) {
      return `${date.getFullYear()}/${this.getShortMonth(date.getMonth())}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      return `${date.getFullYear()}/${this.getShortMonth(date.getMonth())}/${date.getDate().toString().padStart(2, '0')}`;
    }
  }

  private getShortMonth(month: number): string {
    switch (month) {
      case 0: return "Янв";
      case 1: return "Фев";
      case 2: return "Мар";
      case 3: return "Апр";
      case 4: return "Май";
      case 5: return "Июн";
      case 6: return "Июл";
      case 7: return "Авг";
      case 8: return "Сен";
      case 9: return "Окт";
      case 10: return "Нов";
      case 11: return "Дек";
    }

    return null;
  }
}
