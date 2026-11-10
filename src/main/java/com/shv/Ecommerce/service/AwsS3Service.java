package com.shv.Ecommerce.service;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class AwsS3Service {
    // Cloudflare R2 (S3-compatible API)
    @Value("${r2.account-id}")
    private String accountId;

    @Value("${r2.access-key}")
    private String accessKey;

    @Value("${r2.secret-key}")
    private String secretKey;

    @Value("${r2.bucket}")
    private String bucketName;

    // Public base URL of the bucket: r2.dev subdomain or custom domain, no trailing slash
    @Value("${r2.public-url}")
    private String publicUrl;

    public String saveImageToS3(MultipartFile photo) {
        try {
            String s3FileName = photo.getOriginalFilename();

            BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);

            // R2 endpoint, region must be "auto"
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(credentials))
                    .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(
                            "https://" + accountId + ".r2.cloudflarestorage.com", "auto"))
                    .withPathStyleAccessEnabled(true)
                    .withChunkedEncodingDisabled(true)
                    .build();


            // Get input stream from photo
            InputStream inputStream = photo.getInputStream();

            // Set metadata for the object
            ObjectMetadata metaData = new ObjectMetadata();
            metaData.setContentType("image/jpeg");
            metaData.setContentLength(photo.getSize());

            // Create a put request to upload the image to s3
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3FileName, inputStream, metaData);
            s3Client.putObject(putObjectRequest);

            return publicUrl + "/" + s3FileName;

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Unable to upload images to R2 bucket " + bucketName + e.getMessage());
        }
    }

    public java.util.List<String> saveImagesToS3(java.util.List<MultipartFile> photos) {
        if (photos == null || photos.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        java.util.List<String> imageUrls = new java.util.ArrayList<>();
        for (MultipartFile photo : photos) {
            if (photo != null && !photo.isEmpty()) {
                imageUrls.add(saveImageToS3(photo));
            }
        }
        return imageUrls;
    }
}
