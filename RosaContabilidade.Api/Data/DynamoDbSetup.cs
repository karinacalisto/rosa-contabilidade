using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;

namespace RosaContabilidade.Api.Data;

public static class DynamoDbSetup
{
    private static readonly string[] TableNames =
    {
        "RosaUsers", "RosaLeads", "RosaPendencies", "RosaPaymentLinks", "RosaDocuments"
    };

    public static async Task EnsureTablesExistAsync(IAmazonDynamoDB client)
    {
        var existingTables = (await client.ListTablesAsync()).TableNames;

        foreach (var tableName in TableNames)
        {
            if (existingTables.Contains(tableName)) continue;

            var request = tableName switch
            {
                "RosaUsers" => CreateUsersTableRequest(),
                "RosaLeads" => CreateLeadsTableRequest(),
                "RosaPendencies" => CreateWithClienteIndexRequest("RosaPendencies"),
                "RosaPaymentLinks" => CreateWithClienteIndexRequest("RosaPaymentLinks"),
                "RosaDocuments" => CreateWithClienteIndexRequest("RosaDocuments"),
                _ => throw new InvalidOperationException($"Unknown table: {tableName}")
            };

            await client.CreateTableAsync(request);
            await WaitForTableActive(client, tableName);
        }
    }

    private static CreateTableRequest CreateUsersTableRequest() => new()
    {
        TableName = "RosaUsers",
        KeySchema = new List<KeySchemaElement>
        {
            new("Id", KeyType.HASH)
        },
        AttributeDefinitions = new List<AttributeDefinition>
        {
            new("Id", ScalarAttributeType.S),
            new("NormalizedEmail", ScalarAttributeType.S)
        },
        GlobalSecondaryIndexes = new List<GlobalSecondaryIndex>
        {
            new()
            {
                IndexName = "Email-index",
                KeySchema = new List<KeySchemaElement>
                {
                    new("NormalizedEmail", KeyType.HASH)
                },
                Projection = new Projection { ProjectionType = ProjectionType.ALL },
                ProvisionedThroughput = new ProvisionedThroughput(5, 5)
            }
        },
        ProvisionedThroughput = new ProvisionedThroughput(5, 5)
    };

    private static CreateTableRequest CreateLeadsTableRequest() => new()
    {
        TableName = "RosaLeads",
        KeySchema = new List<KeySchemaElement>
        {
            new("Id", KeyType.HASH)
        },
        AttributeDefinitions = new List<AttributeDefinition>
        {
            new("Id", ScalarAttributeType.S),
            new("Origem", ScalarAttributeType.S)
        },
        GlobalSecondaryIndexes = new List<GlobalSecondaryIndex>
        {
            new()
            {
                IndexName = "Origem-index",
                KeySchema = new List<KeySchemaElement>
                {
                    new("Origem", KeyType.HASH)
                },
                Projection = new Projection { ProjectionType = ProjectionType.ALL },
                ProvisionedThroughput = new ProvisionedThroughput(5, 5)
            }
        },
        ProvisionedThroughput = new ProvisionedThroughput(5, 5)
    };

    private static CreateTableRequest CreateWithClienteIndexRequest(string tableName) => new()
    {
        TableName = tableName,
        KeySchema = new List<KeySchemaElement>
        {
            new("Id", KeyType.HASH)
        },
        AttributeDefinitions = new List<AttributeDefinition>
        {
            new("Id", ScalarAttributeType.S),
            new("ClienteId", ScalarAttributeType.S)
        },
        GlobalSecondaryIndexes = new List<GlobalSecondaryIndex>
        {
            new()
            {
                IndexName = "ClienteId-index",
                KeySchema = new List<KeySchemaElement>
                {
                    new("ClienteId", KeyType.HASH)
                },
                Projection = new Projection { ProjectionType = ProjectionType.ALL },
                ProvisionedThroughput = new ProvisionedThroughput(5, 5)
            }
        },
        ProvisionedThroughput = new ProvisionedThroughput(5, 5)
    };

    private static async Task WaitForTableActive(IAmazonDynamoDB client, string tableName)
    {
        var attempts = 0;
        while (attempts < 30)
        {
            var response = await client.DescribeTableAsync(tableName);
            if (response.Table.TableStatus == TableStatus.ACTIVE) return;
            await Task.Delay(1000);
            attempts++;
        }
        throw new TimeoutException($"Table {tableName} did not become active in time.");
    }
}
