package com.tsmc.pqo.etl.cis.batch;

import java.util.List;

import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tsmc.pqo.etl.cis.model.jpa.TiRawWaferQues;
import com.tsmc.pqo.etl.cis.repository.TiRawWaferQuesDao;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TiRawWaferQuesWriter implements ItemWriter<TiRawWaferQues> {

    @Autowired
    private TiRawWaferQuesDao dao;

    @Override
    public void write(List<? extends TiRawWaferQues> items) {
        dao.saveAll(items);
        log.info("write to: {}", items.toString());
    }
}