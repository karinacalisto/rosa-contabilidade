using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using DocModel = RosaContabilidade.Api.Models.Document;

namespace RosaContabilidade.Api.Data.Repositories;

public class DocumentRepository
{
    private readonly IDynamoDBContext _db;

    public DocumentRepository(IDynamoDBContext db) => _db = db;

    public async Task<DocModel?> GetByIdAsync(string id)
        => await _db.LoadAsync<DocModel>(id);

    public async Task<List<DocModel>> GetAllAsync(string? clienteId = null)
    {
        if (!string.IsNullOrEmpty(clienteId))
        {
            var search = _db.FromQueryAsync<DocModel>(new QueryOperationConfig
            {
                IndexName = "ClienteId-index",
                KeyExpression = new Expression
                {
                    ExpressionStatement = "ClienteId = :v",
                    ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                    {
                        { ":v", clienteId }
                    }
                }
            });
            return await search.GetRemainingAsync();
        }

        return await _db.ScanAsync<DocModel>(default(List<ScanCondition>), null).GetRemainingAsync();
    }

    public async Task<List<DocModel>> GetByClienteIdAsync(string clienteId)
    {
        var search = _db.FromQueryAsync<DocModel>(new QueryOperationConfig
        {
            IndexName = "ClienteId-index",
            KeyExpression = new Expression
            {
                ExpressionStatement = "ClienteId = :v",
                ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                {
                    { ":v", clienteId }
                }
            }
        });
        return await search.GetRemainingAsync();
    }

    public async Task<DocModel> CreateAsync(DocModel item)
    {
        await _db.SaveAsync(item);
        return item;
    }

    public async Task DeleteAsync(string id)
    {
        await _db.DeleteAsync<DocModel>(id);
    }
}
