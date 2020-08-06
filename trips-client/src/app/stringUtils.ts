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

export function dateToQueryParamString(date: string|Date): string {
  if (date) {
    if (typeof date == "string") {
      return dateToQueryParamStringCore(new Date(date));
    } else {
      return dateToQueryParamStringCore(date);
    }
  } else {
    return "";
  }
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

export function dateToUIString(date: Date, withTime: boolean): string {
  if (withTime) {
    return `${date.getDate().toString().padStart(2, '0')}/${getShortMonth(date.getMonth())}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getDate().toString().padStart(2, '0')}/${getShortMonth(date.getMonth())}/${date.getFullYear()}`;
  }
}

function dateToQueryParamStringCore(date: Date) {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function dateToInputStringCore(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
}

function getShortMonth(month: number): string {
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

  constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

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
          return new Coordinates(previousNumber, currentNumber);
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

export function createGoogleRefFromCoordinates(coordinates: Coordinates): string {
  return `https://www.google.com/maps/place/${coordinates.latitudeDegreeStr}+${coordinates.longitudeDegreeStr}`;
}

// From place location field tries to recognize coordinates, and if succeeds, returns
// google ref to these coordinates. If not succeed, returns null.
export function createGoogleRefFromLocation(locationValue: string): string {
  let coordsObj = parseCoordinates(locationValue);
  if (coordsObj) {
    return createGoogleRefFromCoordinates(coordsObj);;
  }

  return null;
}

export function getPictureUrl(id: string, format: PicFormat) {
  return PICS_BASE_PATH + "/" + id + getFileExtensionFor(format);
}

function getFileExtensionFor(format: PicFormat) {
  switch (format) {
    case PicFormat.JPEG:
      return ".jpg";
    case PicFormat.PNG:
      return ".png";
    case PicFormat.BMP:
      return ".bmp"; 
  }

  return "";
}

const ALL_COLORS = "aliceblue,#f0f8ff,antiquewhite,#faebd7,aqua,#00ffff,aquamarine,#7fffd4,azure,#f0ffff,beige,#f5f5dc,bisque,#ffe4c4,black,#000000,blanchedalmond,#ffebcd,blue,#0000ff,blueviolet,#8a2be2,brown,#a52a2a,burlywood,#deb887,cadetblue,#5f9ea0,chartreuse,#7fff00,chocolate,#d2691e,coral,#ff7f50,cornflowerblue,#6495ed,cornsilk,#fff8dc,crimson,#dc143c,cyan,#00ffff,darkblue,#00008b,darkcyan,#008b8b,darkgoldenrod,#b8860b,darkgray,#a9a9a9,darkgreen,#006400,darkkhaki,#bdb76b,darkmagenta,#8b008b,darkolivegreen,#556b2f,darkorange,#ff8c00,darkorchid,#9932cc,darkred,#8b0000,darksalmon,#e9967a,darkseagreen,#8fbc8f,darkslateblue,#483d8b,darkslategray,#2f4f4f,darkturquoise,#00ced1,darkviolet,#9400d3,deeppink,#ff1493,deepskyblue,#00bfff,dimgray,#696969,dodgerblue,#1e90ff,firebrick,#b22222,floralwhite,#fffaf0,forestgreen,#228b22,fuchsia,#ff00ff,gainsboro,#dcdcdc,ghostwhite,#f8f8ff,gold,#ffd700,goldenrod,#daa520,gray,#808080,green,#008000,greenyellow,#adff2f,honeydew,#f0fff0,hotpink,#ff69b4,indianred,#cd5c5c,indigo,#4b0082,ivory,#fffff0,khaki,#f0e68c,lavender,#e6e6fa,lavenderblush,#fff0f5,lawngreen,#7cfc00,lemonchiffon,#fffacd,lightblue,#add8e6,lightcoral,#f08080,lightcyan,#e0ffff,lightgoldenrodyellow,#fafad2,lightgrey,#d3d3d3,lightgreen,#90ee90,lightpink,#ffb6c1,lightsalmon,#ffa07a,lightseagreen,#20b2aa,lightskyblue,#87cefa,lightslategray,#778899,lightsteelblue,#b0c4de,lightyellow,#ffffe0,lime,#00ff00,limegreen,#32cd32,linen,#faf0e6,magenta,#ff00ff,maroon,#800000,mediumaquamarine,#66cdaa,mediumblue,#0000cd,mediumorchid,#ba55d3,mediumpurple,#9370d8,mediumseagreen,#3cb371,mediumslateblue,#7b68ee,mediumspringgreen,#00fa9a,mediumturquoise,#48d1cc,mediumvioletred,#c71585,midnightblue,#191970,mintcream,#f5fffa,mistyrose,#ffe4e1,moccasin,#ffe4b5,navajowhite,#ffdead,navy,#000080,oldlace,#fdf5e6,olive,#808000,olivedrab,#6b8e23,orange,#ffa500,orangered,#ff4500,orchid,#da70d6,palegoldenrod,#eee8aa,palegreen,#98fb98,paleturquoise,#afeeee,palevioletred,#d87093,papayawhip,#ffefd5,peachpuff,#ffdab9,peru,#cd853f,pink,#ffc0cb,plum,#dda0dd,powderblue,#b0e0e6,purple,#800080,rebeccapurple,#663399,red,#ff0000,rosybrown,#bc8f8f,royalblue,#4169e1,saddlebrown,#8b4513,salmon,#fa8072,sandybrown,#f4a460,seagreen,#2e8b57,seashell,#fff5ee,sienna,#a0522d,silver,#c0c0c0,skyblue,#87ceeb,slateblue,#6a5acd,slategray,#708090,snow,#fffafa,springgreen,#00ff7f,steelblue,#4682b4,tan,#d2b48c,teal,#008080,thistle,#d8bfd8,tomato,#ff6347,turquoise,#40e0d0,violet,#ee82ee,wheat,#f5deb3,white,#ffffff,whitesmoke,#f5f5f5,yellow,#ffff00,yellowgreen,#9acd32";

let webToStandardColorMap: Map<string, string> = null;

// Returns standard color (for example, "blue") for color representation which starts with "#". If not found, returns null.
export function getStandardColor(webColor: string): string {
  if (!webColor) {
    return null;
  }

  if (!webToStandardColorMap) {
    webToStandardColorMap = new Map<string, string>();
    let items = ALL_COLORS.split(",");
    for (let i=0; i+1<items.length; i+=2) {
      webToStandardColorMap.set(items[i+1], items[i]);
    }
  }

  let key = webColor.toLowerCase();
  if (webToStandardColorMap.has(key)) {
    return webToStandardColorMap.get(key);
  }

  return null;
}