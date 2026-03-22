using Amazon.S3;
using Amazon.S3.Model;

namespace RosaContabilidade.Api.Services;

public class S3StorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucketName;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(IAmazonS3 s3, IConfiguration config, ILogger<S3StorageService> logger)
    {
        _s3 = s3;
        _bucketName = config["Aws:S3BucketName"] ?? "rosa-contabilidade-docs";
        _logger = logger;
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var key = $"documents/{Guid.NewGuid()}/{fileName}";

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3.PutObjectAsync(request);
        _logger.LogInformation("Arquivo enviado para S3: {Key}", key);
        return key;
    }

    public async Task<(Stream Stream, string ContentType)> DownloadAsync(string s3Key)
    {
        var response = await _s3.GetObjectAsync(_bucketName, s3Key);
        return (response.ResponseStream, response.Headers.ContentType);
    }

    public async Task DeleteAsync(string s3Key)
    {
        await _s3.DeleteObjectAsync(_bucketName, s3Key);
        _logger.LogInformation("Arquivo removido do S3: {Key}", s3Key);
    }

    public async Task EnsureBucketExistsAsync()
    {
        try
        {
            await _s3.EnsureBucketExistsAsync(_bucketName);
            _logger.LogInformation("Bucket S3 verificado: {Bucket}", _bucketName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Não foi possível criar/verificar bucket {Bucket}. Ele pode já existir ou você não tem permissão.", _bucketName);
        }
    }
}
