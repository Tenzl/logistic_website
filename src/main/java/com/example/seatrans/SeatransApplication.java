package com.example.seatrans;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

@SpringBootApplication
@ServletComponentScan  // Enable @WebFilter scanning
public class SeatransApplication {

	public static void main(String[] args) {
		SpringApplication.run(SeatransApplication.class, args);
	}

}
