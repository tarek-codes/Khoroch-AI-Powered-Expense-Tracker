import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseEnvelope<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseEnvelope<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res) => {
        let message = 'Operation successful';
        let data = res;

        if (res && typeof res === 'object' && 'data' in res && 'message' in res) {
          message = res.message;
          data = res.data;
        } else if (res && typeof res === 'object' && 'data' in res && Object.keys(res).length === 1) {
          data = res.data;
        } else if (res && typeof res === 'object' && 'message' in res && Object.keys(res).length === 1) {
          message = res.message;
          data = null;
        }

        return {
          success: true,
          statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
