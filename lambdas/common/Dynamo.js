const AWS = require('aws-sdk');

let options = {}
if (process.env.IS_OFFLINE){
    options = {
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    }
}

const documentClient = new AWS.DynamoDB.DocumentClient(options);

const Dynamo = {
    async get(ID, TableName) {
        const params = {
            TableName,
            Key: {
                ID,
            },
        };
        const data = await documentClient.get(params).promise();
        if (!data || !data.Item) {
            throw Error(`There was an error fetching the data for ID of ${ID} from ${TableName}`);
        }
        console.log(data);
        return data.Item;
    },
    
    async write(data, TableName) {
        if (!data.ID) {
            throw Error('no ID on the data');
        }
        const params = {
            TableName,
            Item: data,
        };
        const res = await documentClient.put(params).promise();
        if (!res) {
            throw Error(`There was an error inserting ID of ${data.ID} in table ${TableName}`);
        }
        return data;
    },

    async delete(ID, TableName) {
        const params = {
            TableName,
            Key: {
                ID,
            },
        };

        return documentClient.delete(params).promise();
    },

    update: async ({ tableName, primaryKey, primaryKeyValue, updateKey, updateValue }) => {
        const params = {
            TableName: tableName,
            Key: { [primaryKey]: primaryKeyValue },
            UpdateExpression: `set ${updateKey} = :updateValue`,
            ExpressionAttributeValues: {
                ':updateValue': updateValue,
            },
        };
        return documentClient.update(params).promise();
    },

    query: async ({ tableName, index, queryKey, queryValue }) => {
        const params = {
            TableName: tableName,
            IndexName: index,
            KeyConditionExpression: `${queryKey} = :hkey`,
            ExpressionAttributeValues: {
                ':hkey': queryValue,
            },
        };
        const res = await documentClient.query(params).promise();
        return res.Items || [];
    },
};
module.exports = Dynamo;