package com.tsmc.pqo.etl.cis.batch;

import java.util.List;

import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tsmc.pqo.etl.cis.model.jpa.TiWfOptCatg;
import com.tsmc.pqo.etl.cis.repository.TiWfOptCatgDao;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TiWfOptCatgWriter implements ItemWriter<TiWfOptCatg> {

    @Autowired
    private TiWfOptCatgDao dao;

    @Override
    public void write(List<? extends TiWfOptCatg> items) {
        dao.saveAll(items);
        log.info("write to: {}", items.toString());
    }
}