package com.proxask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ProxAskApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProxAskApplication.class, args);
	}

}
