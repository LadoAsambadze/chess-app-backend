import { type ArgumentMetadata, type PipeTransform } from '@nestjs/common';
export declare class StringToLowercasePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
}
