import { Component, OnInit, SimpleChanges, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { PlaceKind, PlaceAccessibility, PlaceCapacity } from 'src/app/models/place';

// In lower case
const allTags = ["b", "i", "u", "s", "color", "size", "h1", "h2", "h3", "url", "img", "placekind", "placeaccess", "placecapacity"];

enum ChunkType { TEXT, URL, IMG, H1, H2, H3, PLACEKIND, PLACEACCESS, PLACECAPACITY };

class Chunk {
  type: ChunkType;
  text: string; // for TEXT, URL, H1, H2, H3
  style: string; // for TEXT
  src: string; // for IMG
  url: string; // for URL, IMG
  value: number; // for PLACEKIND, PLACEACCESS, PLACECAPACITY
}

class DetectionResult {
  tagLength: number; // length including brackets
  isOpening: boolean;
  tagName: string;
  parameter: string;
}

const ERR_CLOSENOTOPENED = "Закрывающий тэг при отсутсвии открывающего: ";
const ERR_PARAMETERIGNORED = "Параметр у тэга в данной ситуации не нужен, и будет проигнорирован. Тэг ";
const ERR_CLOSEPARAMETERIGNORED = "Закрывающие тэги должны быть без параметров. Параметр проигнорирован в тэге ";
const ERR_REQPARAMETERMISSING_1 = "Не указан параметр тэга ";
const ERR_REQPARAMETERMISSING_2 = ". Тэг проигнорирован.";
const ERR_TAGINSIDEURL_1 = "Внутри тэга [url] из всех тэгов разрешён только [img]. Тэг ";
const ERR_TAGINSIDEURL_2 = " проигнорирован.";
const ERR_NESTEDFORBIDDEN_1 = "Вложенные тэги для ";
const ERR_NESTEDFORBIDDEN_2 = " не разрешены. Тэг ";
const ERR_NESTEDFORBIDDEN_3 = " проигнорирован.";
const ERR_IMGNOSRC = "Отсутсвует адрес картинки в тэге [img].";
const ERR_URLIMGDOESNTWORK = "Для конструкции [url]...[img]...[/img]...[/url] необходимо указать адрес ссылки в начальном тэге [url]. Адрес не был указан, ссылка создана не будет.";
const ERR_INVALIDCOLOR = "Неправильно указан цвет в тэге [color].";
const ERR_INCORRECTSIZE = "Неправильно указан размер шрифта в тэге [size]."
const ERR_TAGNOTCLOSED = "Не закрыт тэг ";

@Component({
  selector: 'app-advanced-text-displayer',
  templateUrl: './advanced-text-displayer.component.html',
  styleUrls: ['./advanced-text-displayer.component.css']
})
export class AdvancedTextDisplayerComponent implements OnInit {
  @Input()
  text: string;

  @Output()
  warningsChange = new EventEmitter<string[]>();

  chunks: Chunk[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["text"]) {
      let warnings: string[] = [];

      if (this.text) {
        this.chunks = this.parseChunks(this.text, warnings);
      } else {
        this.chunks = [];
      }

      this.warningsChange.emit(warnings);
    }
  }

  ChunkType = ChunkType;

  private parseChunks(text: string, errors: string[]): Chunk[] {
    if (!errors) {
      errors = [];
    }

    let result: Chunk[] = [];
    
    // For intersectable tags: keep some kind of stack/counters
    let depthB = 0;
    let depthI = 0;
    let depthU = 0;
    let depthS = 0;
    let stackColor: string[] = [];
    let stackSize: number[] = [];

    // For collecting everything that is not a tag to a string
    let currentText = "";

    // State of state machine:
    // Which kind of region we are currently in
    let currentChunkMode = ChunkType.TEXT;
    // Some kind of degenerate stack for "currentChunkMode" variable, which can only be maximum level of 2.
    // Valid and used for currentChunkMode == IMG only.
    let previousChunkMode = ChunkType.TEXT;

    // For URLs only: remember the parameter of open tag
    let urlTagParameter: string = null;
    // For URLs only: detect if the tag contains nested [img]
    let urlTagContainsImg: boolean = false;

    let position: number = 0;
    while (position < text.length) {
      // In any case we need to know if there is a tag, so - on global level, before state check
      let tagAtPosition = this.detectTagAt(text, position);
      if (tagAtPosition) {
        switch (currentChunkMode) {
          case ChunkType.TEXT: {
            // The broadest state, supports beginning of all tags.

            if (tagAtPosition.isOpening) {
              switch (tagAtPosition.tagName) {
                case "b": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  
                  if ((depthB == 0) && (currentText.length > 0)) { // the change in format, end previous chunk
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = ""; // new chunk begins
                  }

                  depthB++;
                } break;
    
                case "i": {
                  this.addParameterIgnored(tagAtPosition, errors);
    
                  if ((depthI == 0) && (currentText.length > 0)) { // the change in format, end previous chunk
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = ""; // new chunk begins
                  }

                  depthI++;
                } break;
    
                case "u": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  
                  if ((depthU == 0) && (currentText.length > 0)) { // the change in format, end previous chunk
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = ""; // new chunk begins
                  }

                  depthU++;
                } break;
    
                case "s": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  
                  if ((depthS == 0) && (currentText.length > 0)) { // the change in format, end previous chunk
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = ""; // new chunk begins
                  }

                  depthS++;
                } break;
    
                case "color": {
                  if (this.checkHasParameter(tagAtPosition, errors)) {
                    if (this.isAcceptableColor(tagAtPosition.parameter)) {
                      // Add previous chunk
                      if (currentText.length > 0) {
                        result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                        currentText = ""; // new chunk begins
                      }

                      stackColor.push(tagAtPosition.parameter);
                    } else {
                      errors.push(ERR_INVALIDCOLOR);
                      // add empty color to the stack, so corresponding closing tag will not break anything
                      stackColor.push("");
                    }
                  } else {
                    // add empty color to the stack, so corresponding closing tag will not break anything
                    stackColor.push("");
                  }
                } break;
    
                case "size": {
                  if (this.checkHasParameter(tagAtPosition, errors)) {
                    let sizeValue = +tagAtPosition.parameter;
                    if ((!isNaN(sizeValue)) && (sizeValue > 0)) {
                      // Add previous chunk
                      if (currentText.length > 0) {
                        result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                        currentText = "";
                      }

                      stackSize.push(sizeValue);
                    } else {
                      errors.push(ERR_INCORRECTSIZE);
                      // Add invalid size to the stack, so corresponding closing tag won't break anything
                      stackSize.push(0);
                    }
                  } else {
                    // Add invalid size to the stack, so corresponding closing tag won't break anything
                    stackSize.push(0);
                  }
                } break;
    
                case "h1": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }
                  // Switch mode
                  currentChunkMode = ChunkType.H1;
                } break;
    
                case "h2": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }
                  // Switch mode
                  currentChunkMode = ChunkType.H2;
                } break;
    
                case "h3": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }
                  // Switch mode
                  currentChunkMode = ChunkType.H3;
                } break;
    
                case "url": {
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }

                  currentChunkMode = ChunkType.URL;
                  urlTagParameter = tagAtPosition.parameter;
                  urlTagContainsImg = false;
                  // That's all. Start to collect inner text.
                } break;
    
                case "img": {
                  this.addParameterIgnored(tagAtPosition, errors);

                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }

                  // Go to "IMG inside of text" mode
                  currentChunkMode = ChunkType.IMG;
                  previousChunkMode = ChunkType.TEXT;
                } break;
    
                case "placekind": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }
                  // Switch mode
                  currentChunkMode = ChunkType.PLACEKIND;
                } break;
    
                case "placeaccess": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }
                  // Switch mode
                  currentChunkMode = ChunkType.PLACEACCESS;
                } break;
    
                case "placecapacity": {
                  this.addParameterIgnored(tagAtPosition, errors);
                  // Finish text chunk
                  if (currentText.length > 0) {
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                    currentText = "";
                  }
                  // Switch mode
                  currentChunkMode = ChunkType.PLACECAPACITY;
                } break;
              } // switch tag name
            } else {
              // Closing tag
    
              // Parameters are ignored for all closing tags, so add the error (common)
              if (tagAtPosition.parameter) {
                errors.push(ERR_CLOSEPARAMETERIGNORED + tagAtPosition.tagName);
              }
    
              switch (tagAtPosition.tagName) {
                case "b": {
                  if (this.checkIsOpened(() => depthB > 0, tagAtPosition.tagName, errors)) {
                    if ((depthB == 1) && (currentText.length > 0)) { // Format will change. Finish the chunk
                      result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                      currentText = "";
                    }

                    depthB--;
                  }
                } break;
    
                case "i": {
                  if (this.checkIsOpened(() => depthI > 0, tagAtPosition.tagName, errors)) {
                    if ((depthI == 1) && (currentText.length > 0)) { // Format will change. Finish the chunk
                      result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                      currentText = "";
                    }

                    depthI--;
                  }
                } break;
    
                case "u": {
                  if (this.checkIsOpened(() => depthU > 0, tagAtPosition.tagName, errors)) {
                    if ((depthU == 1) && (currentText.length > 0)) { // Format will change. Finish the chunk
                      result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                      currentText = "";
                    }

                    depthU--;
                  }
                } break;
    
                case "s": {
                  if (this.checkIsOpened(() => depthS > 0, tagAtPosition.tagName, errors)) {
                    if ((depthS == 1) && (currentText.length > 0)) { // Format will change. Finish the chunk
                      result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                      currentText = "";
                    }

                    depthS--;
                  }
                } break;
    
                case "color": {
                  if (this.checkIsOpened(() => stackColor.length > 0, tagAtPosition.tagName, errors)) {
                    if (currentText.length > 0) { // In case of color we assume format always changes. Finish the chunk
                      result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                      currentText = "";
                    }

                    stackColor.pop();
                  }
                } break;
    
                case "size": {
                  if (this.checkIsOpened(() => stackSize.length > 0, tagAtPosition.tagName, errors)) {
                    if (currentText.length > 0) { // // In case of size we assume format always changes. Finish the chunk
                      result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                      currentText = "";
                    }

                    stackSize.pop();
                  }
                } break;
    
                default: {
                  // All the other tags require special state, and cannot legally finish while we are in "TEXT" mode.
                  // Put error.
                  errors.push(ERR_CLOSENOTOPENED + tagAtPosition.tagName);
                }
              } // switch tag name
            } // if is opening tag or closing
          } break;

          case ChunkType.URL: {
            // Ok so we have a tag now, let's look for allowed cases
            if (tagAtPosition.isOpening) {
              if (tagAtPosition.tagName == "img") {
                // In order for such construction to work, address as url tag parameter is mandatory.
                // Put possible error only on first occurance of [img].
                if (!urlTagContainsImg) {
                  if (!urlTagParameter) {
                    errors.push(ERR_URLIMGDOESNTWORK);
                  }
                }

                urlTagContainsImg = true;

                // Make chunk of what we currently have
                if (currentText.length > 0) {
                  if (urlTagParameter || (!urlTagContainsImg)) {
                    result.push(this.createUrlChunk(currentText, urlTagParameter));
                  } else {
                    // In case of broken ref create as text segment
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                  }

                  currentText = "";
                }

                currentChunkMode = ChunkType.IMG;
                previousChunkMode = ChunkType.URL;
              } else {
                errors.push(ERR_TAGINSIDEURL_1 + tagAtPosition.tagName + ERR_TAGINSIDEURL_2);
              }
            } else {
              if (tagAtPosition.tagName == "url") {
                this.addParameterIgnored(tagAtPosition, errors);

                if (currentText.length > 0) {
                  if (urlTagParameter || (!urlTagContainsImg)) {
                    result.push(this.createUrlChunk(currentText, urlTagParameter));
                  } else {
                    // In case of broken ref create as text segment
                    result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
                  }
                  
                  currentText = "";
                }

                // Ready. Return to plain text mode
                currentChunkMode = ChunkType.TEXT;
              } else {
                errors.push(ERR_TAGINSIDEURL_1 + tagAtPosition.tagName + ERR_TAGINSIDEURL_2);
              }
            }
          } break;

          case ChunkType.IMG: {
            // OK so we have a tag now, and it should better be closing img
            if (this.checkIsExpectedClosingTag(tagAtPosition, "img", errors)) {
              if (currentText) {
                let imgChunk = new Chunk();
                imgChunk.type = ChunkType.IMG;
                imgChunk.src = currentText;

                // What if this is link-image
                if (previousChunkMode == ChunkType.URL) {
                  if (urlTagParameter) {
                    imgChunk.url = urlTagParameter;
                  } // else add as simple IMG chunk
                }

                result.push(imgChunk);

                // Return to the previous state
                currentChunkMode = previousChunkMode;
                currentText = "";
              } else {
                errors.push(ERR_IMGNOSRC);
                // Return to the previous state, but without creating an IMG chunk
                currentChunkMode = previousChunkMode;
              }
            }
          } break;

          case ChunkType.H1: {
            // Check the only legal case
            if (this.checkIsExpectedClosingTag(tagAtPosition, "h1", errors)) {
              if (currentText.length > 0) {
                result.push(this.createGenericTextChunk(ChunkType.H1, currentText));
              }

              currentText = "";
              currentChunkMode = ChunkType.TEXT;
            }
          } break;

          case ChunkType.H2: {
            if (this.checkIsExpectedClosingTag(tagAtPosition, "h2", errors)) {
              if (currentText.length > 0) {
                result.push(this.createGenericTextChunk(ChunkType.H2, currentText));
              }

              currentText = "";
              currentChunkMode = ChunkType.TEXT;
            }
          } break;

          case ChunkType.H3: {
            if (this.checkIsExpectedClosingTag(tagAtPosition, "h3", errors)) {
              if (currentText.length > 0) {
                result.push(this.createGenericTextChunk(ChunkType.H3, currentText));
              }

              currentText = "";
              currentChunkMode = ChunkType.TEXT;
            }
          } break;

          case ChunkType.PLACEKIND: {
            if (this.checkIsExpectedClosingTag(tagAtPosition, "placekind", errors)) {
              let numValue = +currentText;
              let value: PlaceKind = isNaN(numValue) ? null : numValue;
              let chunk = new Chunk();
              chunk.type = ChunkType.PLACEKIND;
              chunk.value = value;
              result.push(chunk);

              currentText = "";
              currentChunkMode = ChunkType.TEXT;
            }
          } break;

          case ChunkType.PLACEACCESS: {
            if (this.checkIsExpectedClosingTag(tagAtPosition, "placeaccess", errors)) {
              let numValue = +currentText;
              let value: PlaceAccessibility = isNaN(numValue) ? null : numValue;
              let chunk = new Chunk();
              chunk.type = ChunkType.PLACEACCESS;
              chunk.value = value;
              result.push(chunk);

              currentText = "";
              currentChunkMode = ChunkType.TEXT;
            }
          } break;

          case ChunkType.PLACECAPACITY: {
            if (this.checkIsExpectedClosingTag(tagAtPosition, "placecapacity", errors)) {
              let numValue = +currentText;
              let value: PlaceAccessibility = isNaN(numValue) ? null : numValue;
              let chunk = new Chunk();
              chunk.type = ChunkType.PLACECAPACITY;
              chunk.value = value;
              result.push(chunk);

              currentText = "";
              currentChunkMode = ChunkType.TEXT;
            }
          } break;
        } // switch current chunk mode

        position += tagAtPosition.tagLength;
      } else {
        // No tag, just a character. Behavior here is the same regardless of state.
        currentText += text[position];
        position++;
      }
    }

    // Check the state at which we stopped
    switch (currentChunkMode) {
      case ChunkType.TEXT: {
        if (currentText.length > 0) {
          result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
        }
      } break;

      case ChunkType.URL: {
        if (currentText.length > 0) {
          // Add what we have till now
          if (urlTagParameter || (!urlTagContainsImg)) {
            result.push(this.createUrlChunk(currentText, urlTagParameter));
          } else {
            // In case of broken ref create as text segment
            result.push(this.createTextChunk(currentText, depthB, depthI, depthU, depthS, stackColor, stackSize));
          }
        }

        errors.push(ERR_TAGNOTCLOSED + "[url]");
      } break;

      case ChunkType.IMG: {
        errors.push(ERR_TAGNOTCLOSED + "[img]");

        // In case of image always error and do nothing, because I'm lazy to copy code here
        if (currentText.length > 0) {
          let imgChunk = new Chunk();
          imgChunk.type = ChunkType.IMG;
          imgChunk.src = currentText;

          // What if this is link-image
          if (previousChunkMode == ChunkType.URL) {
            errors.push(ERR_TAGNOTCLOSED + "[url]");

            if (urlTagParameter) {
              imgChunk.url = urlTagParameter;
            } // else add as simple IMG chunk
          }

          result.push(imgChunk);
        } else {
          errors.push(ERR_IMGNOSRC);
          if (previousChunkMode == ChunkType.URL) {
            errors.push(ERR_TAGNOTCLOSED + "[url]");
          }
        }
      } break;

      case ChunkType.H1: {
        if (currentText.length > 0) {
          result.push(this.createGenericTextChunk(ChunkType.H1, currentText));
        }

        errors.push(ERR_TAGNOTCLOSED + "[h1]");
      } break;

      case ChunkType.H2: {
        if (currentText.length > 0) {
          result.push(this.createGenericTextChunk(ChunkType.H2, currentText));
        }

        errors.push(ERR_TAGNOTCLOSED + "[h2]");
      } break;

      case ChunkType.H3: {
        if (currentText.length > 0) {
          result.push(this.createGenericTextChunk(ChunkType.H3, currentText));
        }

        errors.push(ERR_TAGNOTCLOSED + "[h3]");
      } break;

      // I could have tried to close these 3 tags if not closed, but just no.
      case ChunkType.PLACEKIND: {
        errors.push(ERR_TAGNOTCLOSED + "[placekind]");
      } break;

      case ChunkType.PLACEACCESS: {
        errors.push(ERR_TAGNOTCLOSED + "[placeaccess]");
      } break;

      case ChunkType.PLACECAPACITY: {
        errors.push(ERR_TAGNOTCLOSED + "[placecapacity]");
      } break;
    }

    // Possible errors (regardless of state)
    if (depthB > 0) {
      errors.push(ERR_TAGNOTCLOSED + "[b]");
    }
    if (depthI > 0) {
      errors.push(ERR_TAGNOTCLOSED + "[i]");
    }
    if (depthU > 0) {
      errors.push(ERR_TAGNOTCLOSED + "[u]");
    }
    if (depthS > 0) {
      errors.push(ERR_TAGNOTCLOSED + "[s]");
    }

    if (stackColor.length > 0) {
      errors.push(ERR_TAGNOTCLOSED + "[color]");
    }
    if (stackSize.length > 0) {
      errors.push(ERR_TAGNOTCLOSED + "[size]");
    }

    // Done
    return result;
  }

  // This function is in reality inner part of parseChunks(), which is repeating there,
  // so made it to the separate function, but meaning of the parameters look in local variables of parseChunks().
  // Makes text chunk object based on current text format.
  private createTextChunk(innerText: string, depthB: number, depthI: number, depthU: number, depthS: number,
                          stackColor: string[], stackSize: number[]): Chunk {
    let result = new Chunk();
    result.type = ChunkType.TEXT;
    result.text = innerText;

    let styleString = "";
    
    if (depthB > 0) {
      styleString += "font-weight:bold;";
    }

    if (depthI > 0) {
      styleString += "font-style:italic;";
    }

    if (depthU > 0) {
      if (depthS > 0) {
        styleString += "text-decoration:underline line-through;";
      } else {
        styleString += "text-decoration:underline;";
      }
    } else {
      if (depthS > 0) {
        styleString += "text-decoration:line-through;";
      }
    }

    let currentColor = this.lastTruthyString(stackColor);
    if (currentColor) {
      styleString += "color:" + currentColor + ";"; // assume it's safe
    }

    let currentSize = this.lastTruthyNumber(stackSize);
    if (currentSize) {
      styleString += "font-size:" + currentSize.toString() + "pt;";
    }

    result.style = styleString;
    return result;
  }

  // Makes url chunk based on inner text and parameter of open [url] tag
  private createUrlChunk(innerText: string, urlTagParameter: string): Chunk {
    let result = new Chunk();
    result.type = ChunkType.URL;
    result.text = innerText;
    if (urlTagParameter) {
      result.url = urlTagParameter;
    } else {
      result.url = innerText;
    }

    return result;
  }

  private createGenericTextChunk(chunkType: ChunkType, text: string): Chunk {
    let result = new Chunk();
    result.type = chunkType;
    result.text = text;
    return result;
  }

  // Check the openedCondition. If true, return true. If false, add error that
  // tag is closed while not being opened yet, and return false.
  private checkIsOpened(openedCondition: () => boolean, tagName: string, errors: string[]): boolean {
    if (openedCondition()) {
      return true;
    } else {
      errors.push(ERR_CLOSENOTOPENED + tagName);
      return false;
    }
  }

  // Checks if tag has parameter. If it has, return true. If it hasn't, add error and return false.
  private checkHasParameter(tag: DetectionResult, errors: string[]): boolean {
    if (tag.parameter) {
      return true;
    } else {
      errors.push(ERR_REQPARAMETERMISSING_1 + tag.tagName + ERR_REQPARAMETERMISSING_2);
      return false;
    }
  }

  // Checks if the tag is closing "expectedTagName" tag. If it is, returns true.
  // If not, adds error "nested tags are not allowed for ..." to errors and returns false.
  private checkIsExpectedClosingTag(tag: DetectionResult, expectedTagName: string, errors: string[]): boolean {
    if ((!tag.isOpening) && (tag.tagName == expectedTagName)) {
      return true;
    } else {
      errors.push(ERR_NESTEDFORBIDDEN_1 + expectedTagName + ERR_NESTEDFORBIDDEN_2 + tag.tagName + ERR_NESTEDFORBIDDEN_3);
      return false;
    }
  }

  // If the tag contains parameter, adds error that parameter was ignored
  private addParameterIgnored(tag: DetectionResult, errors: string[]) {
    if (tag.parameter) {
      errors.push(ERR_PARAMETERIGNORED + tag.tagName);
    }
  }

  private detectTagAt(text: string, position: number): DetectionResult {
    if ((position >= 0) && (position < text.length) && (text.charAt(position) == "[")) {
      let tagLength = 1; // opening bracket

      // Opening or closing
      let isOpening = true;
      if ((position + 1 < text.length) && (text[position + 1] == "/")) {
        isOpening = false;
        // Shift everything so the rest of algorithm can work
        tagLength += 1;
        position += 1;
      }

      position++;
      let detectedTags = allTags.filter(t => this.startsAt(text, position, t));
      if (detectedTags.length > 0) {
        // Find the longest one
        let detectedTag = detectedTags.reduce((previousMax, item) => {
          if (previousMax) {
            return (item.length > previousMax.length) ? item : previousMax;
          } else {
            return item;
          }
        });

        tagLength += detectedTag.length;

        // What goes next
        position = position + detectedTag.length;
        if (position < text.length) {
          if (text[position] == "]") {
            // That's it, detect as is
            return { tagLength: tagLength + 1, isOpening: isOpening, tagName: detectedTag, parameter: null };
          } else if (text[position] == "=") {
            // Parameter
            let parameterValue: string = "";
            tagLength++;
            position++;
            while (position < text.length) {
              if (text[position] == "]") {
                // That's it
                return { tagLength: tagLength + 1, isOpening: isOpening, tagName: detectedTag, parameter: parameterValue };
              } else {
                parameterValue += text[position];
                position++;
                tagLength++;
              }
            }

            // Exit cycle by reaching the end of the text == tag was never closed, abort everything.
          } else {
            // May be some future tag. Ignore silently.
          }
        }
      }
    }

    return null;
  }

  private startsAt(text: string, positionInText: number, searchStringLowerCase: string): boolean {
    if ((positionInText >= 0) && (positionInText + searchStringLowerCase.length <= text.length)) {
      for (let i=0; i<searchStringLowerCase.length; i++) {
        if (text.charAt(positionInText + i).toLowerCase() != searchStringLowerCase.charAt(i)) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  private isAcceptableColor(colorStr: string): boolean {
    // Lazy to check if it's correct, so just sheck for forbidden characters
    return (colorStr) && (colorStr.indexOf("[") < 0)
           && (colorStr.indexOf("]") < 0)
           && (colorStr.indexOf(":") < 0)
           && (colorStr.indexOf(";") < 0);
  }

  private lastTruthyString(strings: string[]): string {
    for (let i=strings.length-1; i>=0; i--) {
      if (strings[i]) {
        return strings[i];
      }
    }

    return null;
  }

  private lastTruthyNumber(numbers: number[]): number {
    for (let i=numbers.length-1; i>=0; i--) {
      if (numbers[i]) {
        return numbers[i];
      }
    }

    return null;
  }
}
