package com.tsmc.pqo.etl.cis.batch;

import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.reactive.function.client.WebClient;

import com.tsmc.pqo.etl.cis.model.to.TiProcOptTo;
import com.tsmc.pqo.etl.cis.repository.TiProcOptDao;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Slf4j
@Component
public class TiProcOptReader implements ItemReader<TiProcOptTo> {

    private int flag;

    @Autowired
    @Qualifier("pdmWebClient")
    private WebClient pdmWebClient;

    @Autowired
    private TiProcOptDao dao;

    private List<TiProcOptTo> opts;

    @PostConstruct
    public void init() {
        flag = 0;
        try {
            Flux<TiProcOptTo> flux = pdmWebClient.get()
                    .uri("/TI_GUI_MB/rest/TiWebService/getTiProcOptByMicrCodeAndStatus")
                    .retrieve()
                    .bodyToFlux(TiProcOptTo.class);

            opts = flux.collect(Collectors.toList()).share().block();

            // purge all first
            if (!CollectionUtils.isEmpty(opts)) {
                dao.deleteAll();
            }
        } catch (Exception e) {
            log.error("init error: {}", e.getMessage(), e);
        }
    }

    @Override
    public TiProcOptTo read() {
        if (CollectionUtils.isEmpty(opts) || flag == opts.size()) {
            return null;
        }

        TiProcOptTo opt = opts.get(flag++);
        log.info("read from: {}", opt.toString());
        return opt;
    }
}