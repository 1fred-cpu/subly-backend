import { Module, OnModuleInit, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { SystemEmailWorker } from './email.processor';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule implements OnModuleInit {
  onModuleInit() {
    // start worker on app boot
    SystemEmailWorker;
  }
}
