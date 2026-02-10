export type WorkloadType = "container" | "serverless" | "vm";
export type ComplianceLevel = "none" | "gdpr" | "hipaa" | "pci" | "soc2";
export interface ScalabilityTarget {
    minUsers?: number;
    maxUsers?: number;
    targetRps?: number;
    availabilitySla?: number;
}
export interface BudgetConstraint {
    monthlyUsd?: number;
    maxMonthlyUsd?: number;
    costOptimizationPriority?: "low" | "medium" | "high";
}
export interface NetworkingIntent {
    region: string;
    multiAz: boolean;
    allowPublicIngress: boolean;
}
export interface DataIntent {
    encryptedAtRest: boolean;
    encryptedInTransit: boolean;
    dataClassification: "public" | "internal" | "confidential" | "restricted";
}
export interface SecurityIntent {
    complianceLevel: ComplianceLevel;
    leastPrivilege: boolean;
    kmsRequired: boolean;
}
export interface ObservabilityIntent {
    enableFlowLogs: boolean;
    centralizedLogging: boolean;
}
export interface InfrastructureIntent {
    workloadType: WorkloadType;
    budgetConstraint?: BudgetConstraint;
    complianceLevel: ComplianceLevel;
    scalabilityTarget: ScalabilityTarget;
    networking: NetworkingIntent;
    data: DataIntent;
    security: SecurityIntent;
    observability: ObservabilityIntent;
    notes?: string;
}
