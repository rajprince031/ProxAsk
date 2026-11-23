package com.proxask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.proxask.repository.jpa")
@EnableMongoRepositories(basePackages = "com.proxask.repository.mongo")
public class ProxAskApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProxAskApplication.class, args);
	}

}
