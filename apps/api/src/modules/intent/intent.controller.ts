import { Body, Controller, Post } from "@nestjs/common";
import { IntentService } from "./intent.service";
import { CreateIntentDto } from "./intent.dto";

@Controller("intent")
export class IntentController {
  constructor(private readonly intentService: IntentService) {}

  @Post()
  async create(@Body() body: CreateIntentDto) {
    return this.intentService.createInfrastructureIntent(body.prompt);
  }
}
