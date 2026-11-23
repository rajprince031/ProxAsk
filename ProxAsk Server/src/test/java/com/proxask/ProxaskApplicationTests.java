package com.proxask;

import com.mongodb.client.MongoClient;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@SpringBootTest
class ProxaskApplicationTests {

    @TestConfiguration
    static class TestMongoConfig {
        @Bean
        @Primary
        public MongoClient mongoClient() {
            return Mockito.mock(MongoClient.class);
        }
    }

    @Test
    void contextLoads() {
    }

}
