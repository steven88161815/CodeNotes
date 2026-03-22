package com.tsmc.pqo.etl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Bean;

import com.tsmc.siview.encrypt.CommonEncryption;
import com.tsmc.siview.encrypt.exception.EncryptionException;

@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class PqoPdmEtlApplication {

    public static void main(String[] args) {
        SpringApplication.run(PqoPdmEtlApplication.class, args);
    }

    @Bean
    public CommonEncryption encryption() throws EncryptionException {
        return new CommonEncryption();
    }
}