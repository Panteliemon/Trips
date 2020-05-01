import { UserHeader } from './user-header';

export class Picture {
    smallSizeId: string;
    mediumSizeId: string;
    largeSizeId: string;
    dateTaken: Date;
    dateUploaded: Date;
    uploadedBy: UserHeader;
    height: number;
    width: number;
}