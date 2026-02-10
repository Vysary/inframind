import { IntentService } from "./intent.service";
import { CreateIntentDto } from "./intent.dto";
export declare class IntentController {
    private readonly intentService;
    constructor(intentService: IntentService);
    create(body: CreateIntentDto): Promise<import("../../../../../packages/shared/types/intent").InfrastructureIntent>;
}
