import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getApiInfo() {
    return {
      name: 'Dealer ERP API',
      status: 'ok',
      environment: this.configService.get<string>('app.nodeEnv'),
      frontendUrl: this.configService.get<string>('app.frontendUrl'),
      docs: {
        health: '/api/health',
      },
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      database: 'configured',
      timestamp: new Date().toISOString(),
    };
  }
}
