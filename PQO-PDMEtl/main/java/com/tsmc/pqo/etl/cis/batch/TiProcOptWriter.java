package com.tsmc.pqo.etl.cis.batch;

import java.util.List;

import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.tsmc.pqo.etl.cis.model.jpa.TiProcOpt;
import com.tsmc.pqo.etl.cis.repository.TiProcOptDao;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TiProcOptWriter implements ItemWriter<TiProcOpt> {

    @Autowired
    private TiProcOptDao dao;

    @Override
    public void write(List<? extends TiProcOpt> items) {
        dao.saveAll(items);
        log.info("write to: {}", items.toString());
    }
}