import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { InfrastructureIntent } from "../../../../../packages/shared/types/intent";

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

@Injectable()
export class IntentService {
  private readonly client: BedrockRuntimeClient;
  private readonly modelId: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>("AWS_REGION");
    this.modelId = this.configService.get<string>("BEDROCK_MODEL_ID") ?? "";

    this.client = new BedrockRuntimeClient({ region });
  }

  async createInfrastructureIntent(
    userPrompt: string,
  ): Promise<InfrastructureIntent> {
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

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    const response = await this.client.send(command);
    const responseText = new TextDecoder().decode(response.body);
    const payload = JSON.parse(responseText);
    const rawText = payload?.content?.[0]?.text ?? "";

    const json = this.extractJson(rawText);
    return JSON.parse(json) as InfrastructureIntent;
  }

  private extractJson(text: string): string {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Bedrock response did not contain valid JSON.");
    }

    return text.slice(start, end + 1);
  }
}
