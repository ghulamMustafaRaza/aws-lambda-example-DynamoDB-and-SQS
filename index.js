const ApiBuilder = require('claudia-api-builder')
	, AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');
var api = new ApiBuilder()
	, dynamoDb = new AWS.DynamoDB.DocumentClient();
api.get('/error', function () {
	throw new ApiBuilder.ApiResponse('NOT OK UPDATED', { 'Content-Type': 'text/html' }, 500);
});

api.post('/items', function (request) { // SAVE your item
	if (request.body.items.length > 100) {
		throw new ApiBuilder.ApiResponse('NOT OK BECAUSE LENGTH OF ITEMS LENGHT MUST BE <= 100', { 'Content-Type': 'text/html' }, 500);
	} else if (!request.body.items || !Array.isArray(request.body.items)) {
		throw new ApiBuilder.ApiResponse('NOT OK BECAUSE LENGTH OF ITEMS MUST BE AN ARRAY', { 'Content-Type': 'text/html' }, 500);
	} else {
		var params = {
			RequestItems: {
				"items": request.body.items.map(item => (
					{
						PutRequest: {
							Item: {
								_id: uuidv1(),
								...item
							}
						}
					}
				))
			}
		};
		return dynamoDb.batchWrite(params).promise(); // returns dynamo result
	}
}, { success: 201 }); // returns HTTP status 201 - Created if successful
api.get('/items', function (request) { // GET all users
	return dynamoDb.scan({ TableName: 'items' }).promise()
		.then(response => response.Items)
});
api.get('/items/{id}', function (request) { // GET all users
	let id = request.pathParams.id;
	return dynamoDb.get({
		TableName: 'items',
		Key: {
			_id: id
		}
	}).promise()
		.then(response => response.Item)
});

api.delete('/items/{id}', (request) => { //DELETE your item
	let id = request.pathParams.id;
	let params = {
		TableName: 'items',
		Key: {
			_id: id,
		}
	};

	return dynamoDb.delete(params).promise()
		.then(() => {
			return 'Deleted item with id "' + id + '"';
		});
}, { success: 201 });

module.exports = api;
