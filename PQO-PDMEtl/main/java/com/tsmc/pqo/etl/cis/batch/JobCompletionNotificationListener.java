package com.tsmc.pqo.etl.cis.batch;

import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListenerSupport;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("{} FINISHED!", jobExecution.getJobInstance().getJobName());
            // mail to admin
            return;
        }

        if (jobExecution.getStatus() == BatchStatus.FAILED) {
            log.warn("{} failed", jobExecution.getJobInstance().getJobName());
            return;
        }

        log.info("job status={}", jobExecution.getStatus());
    }
}