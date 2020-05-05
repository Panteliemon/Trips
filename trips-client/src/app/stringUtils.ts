export function isAllSpaces(str: string): boolean {
  let allSpaces: boolean = true;
  for (let i=0; i<str.length; i++) {
    if (str.charCodeAt(i) > 32) {
      allSpaces = false;
      break;
    }
  }

  return allSpaces;
}

export function dateToInputString(date: string|Date): string {
  if (date) {
    if (typeof date == "string") {
      return dateToInputStringCore(new Date(date));
    } else {
      return dateToInputStringCore(date);
    }
  } else {
    return "";
  }
}

function dateToInputStringCore(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

export function inputStringToDate(str: string): Date {
  if (str) {
    return new Date(str);
  } else {
    return null;
  }
}

export function possibleStringToDate(stringOrDate: string|Date): Date {
  if (stringOrDate) {
    if (typeof stringOrDate == "string") {
      return new Date(stringOrDate);
    } else {
      return stringOrDate;
    }
  } else {
    return null;
  }
}