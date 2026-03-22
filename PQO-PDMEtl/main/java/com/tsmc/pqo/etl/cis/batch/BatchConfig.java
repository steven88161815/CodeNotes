package com.tsmc.pqo.etl.cis.batch;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.tsmc.pqo.etl.cis.model.jpa.TiProcOpt;
import com.tsmc.pqo.etl.cis.model.to.TiProcOptTo;
import com.tsmc.pqo.etl.cis.model.jpa.TiWfOptCatg;
import com.tsmc.pqo.etl.cis.model.to.TiWfOptCatgTo;
import com.tsmc.pqo.etl.cis.model.jpa.TiRawWaferQues;
import com.tsmc.pqo.etl.cis.model.to.TiRawWaferQuesTo;

@Configuration
@EnableBatchProcessing
public class BatchConfig {

    @Autowired
    public JobBuilderFactory jobBuilderFactory;

    @Autowired
    public StepBuilderFactory stepBuilderFactory;

    // --- TiProcOpt Section ---

    @Bean
    @Autowired
    public Step pushTiProcOptStep(TiProcOptReader reader, 
                                  TiProcOptProcessor processor, 
                                  TiProcOptWriter writer) {
        return stepBuilderFactory.get("pushTiProcOpt")
                .<TiProcOptTo, TiProcOpt>chunk(Integer.MAX_VALUE)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job pushTiProcOptJob(JobCompletionNotificationListener listener, 
                                Step pushTiProcOptStep) {
        return jobBuilderFactory.get("pushTiProcOptJob")
                // .incrementer(new RunIdIncrementer())
                .listener(listener)
                .flow(pushTiProcOptStep)
                .end()
                .build();
    }

    // --- TiWfOptCatg Section ---

    @Bean
    @Autowired
    public Step pushTiWfOptCatgStep(TiWfOptCatgReader reader, 
                                    TiWfOptCatgProcessor processor, 
                                    TiWfOptCatgWriter writer) {
        return stepBuilderFactory.get("pushTiWfOptCatg")
                .<TiWfOptCatgTo, TiWfOptCatg>chunk(20)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job pushTiWfOptCatgJob(JobCompletionNotificationListener listener, 
                                  Step pushTiWfOptCatgStep) {
        return jobBuilderFactory.get("pushTiWfOptCatgJob")
                // .incrementer(new RunIdIncrementer())
                .listener(listener)
                .flow(pushTiWfOptCatgStep)
                .end()
                .build();
    }

    // --- TiRawWaferQues Section ---

    @Bean
    @Autowired
    public Step pushTiRawWaferQuesStep(TiRawWaferQuesReader reader, 
                                       TiRawWaferQuesProcessor processor, 
                                       TiRawWaferQuesWriter writer) {
        return stepBuilderFactory.get("pushTiRawWaferQues")
                .<TiRawWaferQuesTo, TiRawWaferQues>chunk(20)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job pushTiRawWaferQuesJob(JobCompletionNotificationListener listener, 
                                     Step pushTiRawWaferQuesStep) {
        return jobBuilderFactory.get("pushTiRawWaferQuesJob")
                // .incrementer(new RunIdIncrementer())
                .listener(listener)
                .flow(pushTiRawWaferQuesStep)
                .end()
                .build();
    }
}