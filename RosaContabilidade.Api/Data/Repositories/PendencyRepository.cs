using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Data.Repositories;

public class PendencyRepository
{
    private readonly IDynamoDBContext _db;

    public PendencyRepository(IDynamoDBContext db) => _db = db;

    public async Task<Pendency?> GetByIdAsync(string id)
        => await _db.LoadAsync<Pendency>(id);

    public async Task<List<Pendency>> GetAllAsync(string? clienteId = null)
    {
        if (!string.IsNullOrEmpty(clienteId))
        {
            var search = _db.FromQueryAsync<Pendency>(new QueryOperationConfig
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

        return await _db.ScanAsync<Pendency>(default(List<ScanCondition>), null).GetRemainingAsync();
    }

    public async Task<List<Pendency>> GetByClienteIdAsync(string clienteId)
    {
        var search = _db.FromQueryAsync<Pendency>(new QueryOperationConfig
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

    public async Task<Pendency> CreateAsync(Pendency item)
    {
        await _db.SaveAsync(item);
        return item;
    }

    public async Task UpdateAsync(Pendency item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveAsync(item);
    }

    public async Task DeleteAsync(string id)
    {
        await _db.DeleteAsync<Pendency>(id);
    }
}
