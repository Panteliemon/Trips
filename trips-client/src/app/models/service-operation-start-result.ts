export enum StartResultCode {
  OK = 0,
  INVALID_ARGUMENT = 1,
  ANOTHER_RUNS_NOW = 2,
  REPEAT_FORBIDDEN = 3
}

export class ServiceOperationStartResult {
    resultCode: StartResultCode;
    operationId: number;
}