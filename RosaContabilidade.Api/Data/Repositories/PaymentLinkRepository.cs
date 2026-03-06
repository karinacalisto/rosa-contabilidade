using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Data.Repositories;

public class PaymentLinkRepository
{
    private readonly IDynamoDBContext _db;

    public PaymentLinkRepository(IDynamoDBContext db) => _db = db;

    public async Task<PaymentLink?> GetByIdAsync(string id)
        => await _db.LoadAsync<PaymentLink>(id);

    public async Task<List<PaymentLink>> GetAllAsync(string? clienteId = null)
    {
        if (!string.IsNullOrEmpty(clienteId))
        {
            var search = _db.FromQueryAsync<PaymentLink>(new QueryOperationConfig
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

        return await _db.ScanAsync<PaymentLink>(default(List<ScanCondition>), null).GetRemainingAsync();
    }

    public async Task<List<PaymentLink>> GetByClienteIdAsync(string clienteId)
    {
        var search = _db.FromQueryAsync<PaymentLink>(new QueryOperationConfig
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

    public async Task<PaymentLink> CreateAsync(PaymentLink item)
    {
        await _db.SaveAsync(item);
        return item;
    }

    public async Task UpdateAsync(PaymentLink item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveAsync(item);
    }

    public async Task DeleteAsync(string id)
    {
        await _db.DeleteAsync<PaymentLink>(id);
    }
}
