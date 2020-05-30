import { ServiceOperationResult } from './service-operation';

export class ServiceOperationStatus {
    operationId: number;
    key: string;
    name: string;
    description: string;
    startTime: Date;
    total: number;
    done: number;
    result: ServiceOperationResult;
    finishTime: Date;
}