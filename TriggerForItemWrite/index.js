console.log('Loading function');
var AWS = require("aws-sdk");
AWS.config.update({region: 'us-east-2'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.handler = async (event, context) => {
    // console.log('Received event:', JSON.stringify(event, null, 2));
    let promises = event.Records.map((record) => {
        var params = {
            DelaySeconds: 0,
            MessageAttributes: {
                eventID: {
                    DataType: "String",
                    StringValue: record.eventID
                },
                eventName: {
                    DataType: "String",
                    StringValue: record.eventName
                },
                dynamodb: {
                    DataType: "String",
                    StringValue: JSON.stringify(record.dynamodb)
                }
            },
            MessageBody: "DynamoDB Table items" + record.eventName,
            QueueUrl: "https://sqs.us-east-2.amazonaws.com/713079236950/dynamoDB_Trigger"
        };
        console.log('sendMessage()')
        return new Promise((res, rej) => {
            sqs.sendMessage(params, function(err, data) {
                if (err) {
                    res("Error", err);
                } else {
                    res("Success", data.MessageId);
                }
                console.log('sendMessage(full-fill)')
            })
        });
        // console.log('sendMessage(end)')
        // console.log(record.eventID);
        // console.log(record.eventName);
        // console.log('DynamoDB Record: %j', record.dynamodb);
    });
    return Promise.all(promises).then((...data) => {
        console.log(data)
        context.succeed(`Successfully processed ${event.Records.length} records.`)
        return (`Successfully processed ${event.Records.length} records.`)
    })
};
