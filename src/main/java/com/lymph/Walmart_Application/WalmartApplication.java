package com.lymph.Walmart_Application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class WalmartApplication {

	public static void main(String[] args) {
		SpringApplication.run(WalmartApplication.class, args);
	}

}
