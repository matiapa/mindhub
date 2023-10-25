import { IsArray, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum LogLevel {
  LOG = 'log',
  EROR = 'error',
  WARN = 'warn',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
  FATAL = 'fatal',
}

export class EnvConfig {
  @IsArray()
  @IsEnum(LogLevel, { each: true })
  @IsNotEmpty()
  loggerLevels: LogLevel[] = process.env.LOGGER_LEVELS.split(',') as LogLevel[];

  @IsNumber()
  @IsNotEmpty()
  port: number = +process.env.PORT!;
}
