import { Construct } from "constructs";
import { Vpc } from "aws-cdk-lib/aws-ec2";
export interface SecureVPCProps {
    cidr?: string;
    natGateways?: number;
    flowLogsEnabled?: boolean;
}
export declare class SecureVPC extends Construct {
    readonly vpc: Vpc;
    constructor(scope: Construct, id: string, props?: SecureVPCProps);
}
