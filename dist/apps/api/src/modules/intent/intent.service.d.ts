import { ConfigService } from "@nestjs/config";
import { InfrastructureIntent } from "../../../../../packages/shared/types/intent";
export declare class IntentService {
    private readonly configService;
    private readonly client;
    private readonly modelId;
    constructor(configService: ConfigService);
    createInfrastructureIntent(userPrompt: string): Promise<InfrastructureIntent>;
    private extractJson;
}
