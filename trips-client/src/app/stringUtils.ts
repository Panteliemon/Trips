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