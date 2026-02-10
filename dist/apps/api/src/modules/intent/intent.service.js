"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const SYSTEM_PROMPT = `You are InfraMind Intent Parser. Convert a single user sentence describing a business need into a strict JSON object named InfrastructureIntent.

Rules:
- Output ONLY valid JSON. No markdown. No explanations.
- Follow the exact schema defined below.
- Apply Security by Design: encryption, least privilege, no public access unless explicitly requested.
- Default to cost-aware settings when budget is mentioned; otherwise choose balanced defaults.
- Infer missing fields with safe defaults; do not omit required fields.
- The JSON must be deterministic for the same input.

Schema (TypeScript reference):
InfrastructureIntent {
  workloadType: "container" | "serverless" | "vm";
  budgetConstraint?: {
    monthlyUsd?: number;
    maxMonthlyUsd?: number;
    costOptimizationPriority?: "low" | "medium" | "high";
  };
  complianceLevel: "none" | "gdpr" | "hipaa" | "pci" | "soc2";
  scalabilityTarget: {
    minUsers?: number;
    maxUsers?: number;
    targetRps?: number;
    availabilitySla?: number;
  };
  networking: {
    region: string;
    multiAz: boolean;
    allowPublicIngress: boolean;
  };
  data: {
    encryptedAtRest: boolean;
    encryptedInTransit: boolean;
    dataClassification: "public" | "internal" | "confidential" | "restricted";
  };
  security: {
    complianceLevel: "none" | "gdpr" | "hipaa" | "pci" | "soc2";
    leastPrivilege: boolean;
    kmsRequired: boolean;
  };
  observability: {
    enableFlowLogs: boolean;
    centralizedLogging: boolean;
  };
  notes?: string;
}

Defaulting Guidance:
- region: "eu-west-1" unless user specifies a region.
- multiAz: true for production or multi-tenant workloads; otherwise true.
- allowPublicIngress: true only if the user explicitly asks for public access.
- encryptedAtRest / encryptedInTransit / kmsRequired / leastPrivilege: true.
- enableFlowLogs / centralizedLogging: true.
- dataClassification: "confidential" if handling user data or transactions; otherwise "internal".
- complianceLevel must align with user request (e.g., GDPR for EU users; HIPAA for health data).
- workloadType: infer serverless for low ops/variable traffic; container for microservices; vm for legacy.

Return the JSON only.`;
let IntentService = class IntentService {
    constructor(configService) {
        var _a;
        this.configService = configService;
        const region = this.configService.get("AWS_REGION");
        this.modelId = (_a = this.configService.get("BEDROCK_MODEL_ID")) !== null && _a !== void 0 ? _a : "";
        this.client = new client_bedrock_runtime_1.BedrockRuntimeClient({ region });
    }
    async createInfrastructureIntent(userPrompt) {
        var _a, _b, _c;
        if (!userPrompt || userPrompt.trim().length === 0) {
            throw new Error("User prompt is required.");
        }
        const body = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1200,
            temperature: 0,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
        };
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: this.modelId,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(body),
        });
        const response = await this.client.send(command);
        const responseText = new TextDecoder().decode(response.body);
        const payload = JSON.parse(responseText);
        const rawText = (_c = (_b = (_a = payload === null || payload === void 0 ? void 0 : payload.content) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : "";
        const json = this.extractJson(rawText);
        return JSON.parse(json);
    }
    extractJson(text) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start === -1 || end === -1 || end <= start) {
            throw new Error("Bedrock response did not contain valid JSON.");
        }
        return text.slice(start, end + 1);
    }
};
exports.IntentService = IntentService;
exports.IntentService = IntentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IntentService);
//# sourceMappingURL=intent.service.js.map