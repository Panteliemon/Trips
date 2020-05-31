import { UserHeader } from './user-header';

export enum PicFormat {
    JPEG = 1,
    PNG = 2,
    BMP = 3
}

export class Picture {
    format: PicFormat;
    smallSizeId: string;
    mediumSizeId: string;
    largeSizeId: string;
    dateTaken: Date;
    dateUploaded: Date;
    uploadedBy: UserHeader;
    description: string;
    height: number;
    width: number;
}