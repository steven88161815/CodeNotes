package com.tsmc.pqo.etl;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.tsmc.siview.encrypt.CommonEncryption;
import com.tsmc.siview.encrypt.exception.EncryptionException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@EnableJpaRepositories(
    basePackages = "com.tsmc.pqo.etl.cis.repository", 
    entityManagerFactoryRef = "pqoEntityManagerFactory", 
    transactionManagerRef = "pqoTransactionManager"
)
@EnableTransactionManagement
@Configuration
public class PQOConfig {

    @Bean("pqoDataSource")
    public DataSource pqoDataSource(
            @Value("${pqoDataSource.jdbcUrl}") String jdbcUrl,
            @Value("${pqoDataSource.username}") String username,
            @Value("${pqoDataSource.password}") String password,
            @Value("${cipher.key}") String cipherKey,
            @Value("${pqoDataSource.maxPoolSize}") int maxPoolSize,
            CommonEncryption encryption) throws EncryptionException {

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setMapPassword(encryption.decryptStringWithKey(password, DigestUtils.sha1Hex(cipherKey)));
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(1);

        return new HikariDataSource(config);
    }

    @Bean("pqoEntityManagerFactory")
    @Autowired
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            @Qualifier("pqoDataSource") DataSource dataSource) {

        LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();
        entityManagerFactoryBean.setDataSource(dataSource);
        entityManagerFactoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.tsmc.pqo.etl.cis.model.jpa" });
        entityManagerFactoryBean.setPersistenceUnitName("pqo-jpa");
        
        return entityManagerFactoryBean;
    }

    @Bean("pqoTransactionManager")
    @Autowired
    public PlatformTransactionManager pqoTransactionManager(
            @Qualifier("pqoEntityManagerFactory") EntityManagerFactory entityManagerFactory) {

        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory);
        
        return transactionManager;
    }
}