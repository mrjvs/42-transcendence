import {
  ClassConstructor,
  classToPlain,
  plainToClass,
} from 'class-transformer';

export function formatObject(
  type: ClassConstructor<unknown>,
  obj: Record<string, any>,
): Record<string, any> {
  return classToPlain(
    plainToClass(type, obj, { excludeExtraneousValues: true }),
  );
}
