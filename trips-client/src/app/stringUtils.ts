import { PicFormat } from './models/picture';
import { PICS_BASE_PATH } from './services/api';

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

// Formats decimal coordinate in degree/minute/second format
function getDegreeStr(degValue: number): string {
  let sign = false;
  if (degValue < 0) {
    sign = true;
    degValue = -degValue;
  }

  // -0°00'00.0"
  let degrees = Math.floor(degValue);
  let fractMinutes = (degValue - degrees)*60;
  let minutes = Math.floor(fractMinutes);
  let fractSeconds = (fractMinutes - minutes)*60;
  let seconds = Math.floor(fractSeconds);
  let tenthOfSeconds = Math.floor((fractSeconds - seconds)*10);
  let result = `${sign?'-':''}${degrees}°${minutes.toString().padStart(2, "0")}'${seconds.toString().padStart(2, "0")}.${tenthOfSeconds}"`;
  return result;
}

export class Coordinates {
  latitude: number;
  longitude: number;

  get latitudeDegreeStr(): string {
    // 0°00'00.0"N
    return getDegreeStr(Math.abs(this.latitude)) + (this.latitude >= 0 ? "N" : "S");
  }

  get longitudeDegreeStr(): string {
    // 0°00'00.0"E
    return getDegreeStr(Math.abs(this.longitude)) + (this.longitude >= 0 ? "E" : "W");
  }
}

// From arbitrary string, which occasionaly might contain geographical coordinates
// in decimal form, extracts these coordinates. If no success, returns null.
export function parseCoordinates(coordStr: string): Coordinates {
  if (!coordStr) {
    return null;
  }

  let split = coordStr.split(/[\s,]+/);
  // find two consequent numbers
  let previousNumber: number = null;
  for (let i=0; i<split.length; i++) {
    let currentNumber = Number(split[i]);
    if (!Number.isNaN(currentNumber)) {
      if (previousNumber !== null) {
        // ok, we have two numbers, validate
        if ((previousNumber > -90) && (previousNumber < 90) && (currentNumber >= -180) && (currentNumber < 180)) {
          let result = new Coordinates();
          result.latitude = previousNumber;
          result.longitude = currentNumber;
          return result;
        } else {
          // May be try the next number
          previousNumber = currentNumber;
        }
      } else {
        previousNumber = currentNumber;
      }
    } else {
      previousNumber = null;
    }
  }

  return null;
}

// From place location field tries to recognize coordinates, and if succeeds, returns
// google ref to these coordinates. If not succeed, returns null.
export function createGoogleRefFromLocation(locationValue: string): string {
  let coordsObj = parseCoordinates(locationValue);
  if (coordsObj) {
    return `https://www.google.com/maps/place/${coordsObj.latitudeDegreeStr}+${coordsObj.longitudeDegreeStr}`;
  }

  return null;
}

export function getPictureUrl(id: string, format: PicFormat) {
  return PICS_BASE_PATH + "/" + id;
}