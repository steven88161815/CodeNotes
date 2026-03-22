package com.tsmc.pqo.etl;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeFilterFunctions;
import org.springframework.web.reactive.function.client.WebClient;

import com.tsmc.siview.encrypt.CommonEncryption;
import com.tsmc.siview.encrypt.exception.EncryptionException;

@Configuration
public class PDMConfig {

    @Bean("pdmWebClient")
    public WebClient pdmWebClient(
            @Value("${pdm.baseurl}") String baseUrl,
            @Value("${pdm.username}") String username,
            @Value("${pdm.password}") String password,
            @Value("${cipher.key}") String cipherKey,
            CommonEncryption encryption) throws EncryptionException {

        return WebClient.builder()
                .baseUrl(baseUrl)
                .filter(ExchangeFilterFunctions.basicAuthentication(
                        username, 
                        encryption.decryptStringWithKey(password, DigestUtils.sha1Hex(cipherKey))
                ))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
    }
}