"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureVPC = void 0;
const constructs_1 = require("constructs");
const aws_ec2_1 = require("aws-cdk-lib/aws-ec2");
const aws_logs_1 = require("aws-cdk-lib/aws-logs");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
class SecureVPC extends constructs_1.Construct {
    constructor(scope, id, props = {}) {
        var _a, _b, _c;
        super(scope, id);
        const cidr = (_a = props.cidr) !== null && _a !== void 0 ? _a : "10.0.0.0/16";
        const natGateways = (_b = props.natGateways) !== null && _b !== void 0 ? _b : 1;
        const flowLogsEnabled = (_c = props.flowLogsEnabled) !== null && _c !== void 0 ? _c : true;
        this.vpc = new aws_ec2_1.Vpc(this, "Vpc", {
            ipAddresses: aws_ec2_1.IpAddresses.cidr(cidr),
            natGateways,
            subnetConfiguration: [
                {
                    name: "public",
                    subnetType: aws_ec2_1.SubnetType.PUBLIC,
                },
                {
                    name: "private",
                    subnetType: aws_ec2_1.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    name: "isolated",
                    subnetType: aws_ec2_1.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });
        if (flowLogsEnabled) {
            const logKey = new aws_kms_1.Key(this, "VpcFlowLogsKey", {
                enableKeyRotation: true,
            });
            const logGroup = new aws_logs_1.LogGroup(this, "VpcFlowLogs", {
                retention: aws_logs_1.RetentionDays.ONE_MONTH,
                encryptionKey: logKey,
            });
            this.vpc.addFlowLog("VpcFlowLogs", {
                destination: aws_ec2_1.FlowLogDestination.toCloudWatchLogs(logGroup),
                trafficType: aws_ec2_1.FlowLogTrafficType.ALL,
            });
        }
    }
}
exports.SecureVPC = SecureVPC;
//# sourceMappingURL=vpc.js.map