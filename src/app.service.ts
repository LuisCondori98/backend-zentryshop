import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getHello(): string {
    return `Welcome my backend shop API`;
  }
}
