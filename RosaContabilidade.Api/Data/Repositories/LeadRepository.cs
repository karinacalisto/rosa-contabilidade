using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using RosaContabilidade.Api.Models;

namespace RosaContabilidade.Api.Data.Repositories;

public class LeadRepository
{
    private readonly IDynamoDBContext _db;

    public LeadRepository(IDynamoDBContext db) => _db = db;

    public async Task<Lead?> GetByIdAsync(string id)
        => await _db.LoadAsync<Lead>(id);

    public async Task<List<Lead>> GetAllAsync(string? origem = null)
    {
        if (!string.IsNullOrEmpty(origem))
        {
            var search = _db.FromQueryAsync<Lead>(new QueryOperationConfig
            {
                IndexName = "Origem-index",
                KeyExpression = new Expression
                {
                    ExpressionStatement = "Origem = :v",
                    ExpressionAttributeValues = new Dictionary<string, DynamoDBEntry>
                    {
                        { ":v", origem }
                    }
                }
            });
            return await search.GetRemainingAsync();
        }

        return await _db.ScanAsync<Lead>(default(List<ScanCondition>), null).GetRemainingAsync();
    }

    public async Task<Lead> CreateAsync(Lead lead)
    {
        await _db.SaveAsync(lead);
        return lead;
    }

    public async Task DeleteAsync(string id)
    {
        await _db.DeleteAsync<Lead>(id);
    }
}
