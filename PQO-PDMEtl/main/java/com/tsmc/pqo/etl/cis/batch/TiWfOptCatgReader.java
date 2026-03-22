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

import com.tsmc.pqo.etl.cis.model.to.TiWfOptCatgTo;
import com.tsmc.pqo.etl.cis.repository.TiWfOptCatgDao;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Slf4j
@Component
public class TiWfOptCatgReader implements ItemReader<TiWfOptCatgTo> {

    private int flag;

    @Autowired
    @Qualifier("pdmWebClient")
    private WebClient pdmWebClient;

    @Autowired
    private TiWfOptCatgDao dao;

    private List<TiWfOptCatgTo> catg;

    @PostConstruct
    public void init() {
        flag = 0;
        try {
            Flux<TiWfOptCatgTo> flux = pdmWebClient.get()
                    .uri("/TI_GUI_MB/rest/TiWebService/getTiWfOptCatgByT14CdAndStatus")
                    .retrieve()
                    .bodyToFlux(TiWfOptCatgTo.class);

            catg = flux.collect(Collectors.toList()).share().block();

            // purge all first
            if (!CollectionUtils.isEmpty(catg)) {
                dao.deleteAll();
            }
        } catch (Exception e) {
            log.error("init error: {}", e.getMessage(), e);
        }
    }

    @Override
    public TiWfOptCatgTo read() {
        if (CollectionUtils.isEmpty(catg) || flag == catg.size()) {
            return null;
        }

        TiWfOptCatgTo cat = catg.get(flag++);
        log.info("read from: {}", catg.toString());
        return cat;
    }
}