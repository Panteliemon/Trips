export enum ServiceOperationResult {
    SUCCEED = 0,
    FAILED = 1,
    CANCELED = 2
}

export class ServiceOperation {
    key: string;
    name: string;
    description: string;
    lastStarted: Date;
    lastEnded: Date;
    lastResult: ServiceOperationResult;
}