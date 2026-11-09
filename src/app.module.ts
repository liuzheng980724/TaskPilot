import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from './mcp/mcp.module.js';
import {EmailModule} from "./email/email.module.js";
import { OauthModule } from './oauth/oauth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    McpModule,
    EmailModule,
    OauthModule
  ],
})
export class AppModule {}