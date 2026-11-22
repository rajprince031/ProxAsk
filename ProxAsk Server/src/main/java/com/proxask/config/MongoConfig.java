package com.proxask.config;

import com.mongodb.WriteConcern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * MongoDB Client & Connection Pool Configuration.
 * Configures optimal socket timeouts, connection pooling, and server selection
 * to prevent initial TLS handshake socket timeouts (MongoSocketOpenException)
 * on MongoDB Atlas replica sets over high-latency networks.
 */
@Configuration
@Slf4j
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsCustomizer() {
        return clientSettingsBuilder -> clientSettingsBuilder
                .applyToSocketSettings(builder -> builder
                        .connectTimeout(15000, TimeUnit.MILLISECONDS)
                        .readTimeout(15000, TimeUnit.MILLISECONDS)
                )
                .applyToClusterSettings(builder -> builder
                        .serverSelectionTimeout(15000, TimeUnit.MILLISECONDS)
                )
                .applyToConnectionPoolSettings(builder -> builder
                        .maxConnectionIdleTime(60000, TimeUnit.MILLISECONDS)
                        .maxWaitTime(15000, TimeUnit.MILLISECONDS)
                        .maxSize(50)
                        .minSize(2)
                )
                .writeConcern(WriteConcern.MAJORITY)
                .retryWrites(true);
    }
}
