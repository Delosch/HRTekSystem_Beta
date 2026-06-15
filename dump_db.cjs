require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');

const client = new DynamoDBClient({ 
    region: process.env.AWS_REGION || 'ap-south-1', 
    credentials: { 
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
    } 
});
const docClient = DynamoDBDocumentClient.from(client);

async function run() { 
    try {
        const res = await docClient.send(new ScanCommand({ 
            TableName: process.env.DYNAMODB_TABLE_NAME || 'b2b_platform', 
            FilterExpression: 'begins_with(sk, :prefix)', 
            ExpressionAttributeValues: { ':prefix': 'HTI_REPORT#' } 
        })); 
        fs.writeFileSync('hti_reports_dump.json', JSON.stringify(res.Items, null, 2));
        console.log("Dumped " + (res.Items ? res.Items.length : 0) + " items");
    } catch (e) {
        console.error(e);
    }
} 
run();
