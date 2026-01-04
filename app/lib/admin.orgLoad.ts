import { ScanCommand } from "@aws-sdk/lib-dynamodb"; 
import { ddbDocClient } from "./dynamodb.server";

export const getAnswerSheet = async () => {
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        FilterExpression: 'begins_with(pk, :company) AND sk = :profile',
        ExpressionAttributeValues: {
            ':company': 'COMPANY#',
            ':profile': 'PROFILE'
        }
    });

    const { Items } = await ddbDocClient.send(command);
    console.log("Answer Sheet : \n", Items);
    return Items;
};
