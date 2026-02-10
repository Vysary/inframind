import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  FlowLogDestination,
  FlowLogTrafficType,
  IpAddresses,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { Key } from "aws-cdk-lib/aws-kms";

export interface SecureVPCProps {
  cidr?: string;
  natGateways?: number;
  flowLogsEnabled?: boolean;
}

export class SecureVPC extends Construct {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: SecureVPCProps = {}) {
    super(scope, id);

    const cidr = props.cidr ?? "10.0.0.0/16";
    const natGateways = props.natGateways ?? 1;
    const flowLogsEnabled = props.flowLogsEnabled ?? true;

    this.vpc = new Vpc(this, "Vpc", {
      ipAddresses: IpAddresses.cidr(cidr),
      natGateways,
      subnetConfiguration: [
        {
          name: "public",
          subnetType: SubnetType.PUBLIC,
        },
        {
          name: "private",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: "isolated",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    if (flowLogsEnabled) {
      const logKey = new Key(this, "VpcFlowLogsKey", {
        enableKeyRotation: true,
      });

      const logGroup = new LogGroup(this, "VpcFlowLogs", {
        retention: RetentionDays.ONE_MONTH,
        encryptionKey: logKey,
      });

      this.vpc.addFlowLog("VpcFlowLogs", {
        destination: FlowLogDestination.toCloudWatchLogs(logGroup),
        trafficType: FlowLogTrafficType.ALL,
      });
    }
  }
}
