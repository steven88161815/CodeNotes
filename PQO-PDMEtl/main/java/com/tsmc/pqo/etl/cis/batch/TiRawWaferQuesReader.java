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

import com.tsmc.pqo.etl.cis.model.to.TiRawWaferQuesTo;
import com.tsmc.pqo.etl.cis.repository.TiRawWaferQuesDao;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

@Slf4j
@Component
public class TiRawWaferQuesReader implements ItemReader<TiRawWaferQuesTo> {

    private int flag;

    @Autowired
    @Qualifier("pdmWebClient")
    private WebClient pdmWebClient;

    @Autowired
    private TiRawWaferQuesDao dao;

    private List<TiRawWaferQuesTo> ques;

    @PostConstruct
    public void init() {
        flag = 0;
        try {
            Flux<TiRawWaferQuesTo> flux = pdmWebClient.get()
                    .uri("/TI_GUI_MB/rest/TiWebService/getTiRawWaferQueByT14CdAndStatus")
                    .retrieve()
                    .bodyToFlux(TiRawWaferQuesTo.class);

            ques = flux.collect(Collectors.toList()).share().block();

            // purge all first
            if (!CollectionUtils.isEmpty(ques)) {
                dao.deleteAll();
            }
        } catch (Exception e) {
            log.error("init error: {}", e.getMessage(), e);
        }
    }

    @Override
    public TiRawWaferQuesTo read() {
        if (CollectionUtils.isEmpty(ques) || flag == ques.size()) {
            return null;
        }

        TiRawWaferQuesTo que = ques.get(flag++);
        log.info("read from: {}", que.toString());
        return que;
    }
}