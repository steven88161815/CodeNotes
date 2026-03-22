package com.tsmc.pqo.etl.cis.batch;

import java.util.Date;

import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import com.tsmc.pqo.etl.cis.model.jpa.TiWfOptCatg;
import com.tsmc.pqo.etl.cis.model.jpa.TiWfOptCatgPK;
import com.tsmc.pqo.etl.cis.model.to.TiWfOptCatgTo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TiWfOptCatgProcessor implements ItemProcessor<TiWfOptCatgTo, TiWfOptCatg> 
{

    @Override
    public TiWfOptCatg process(TiWfOptCatgTo item) 
    {
        TiWfOptCatg catg = new TiWfOptCatg();
        TiWfOptCatgPK id = new TiWfOptCatgPK();
        catg.setId(id);

        // Mapping Composite PK fields
        catg.getId().setTf1Cd(item.getTf1Cd());
        catg.getId().setGeomCd(item.getGeomCd());
        catg.getId().setWfTl2Cd(item.getWfTl2Cd());
        catg.getId().setWfTl3Cd(item.getWfTl3Cd());
        catg.getId().setWfTl4Cd(item.getWfTl4Cd());
        catg.getId().setMaskCode(item.getMaskCode());
        catg.getId().setUsagCode(item.getUsagCode());
        catg.getId().setOptGroup(item.getOptGroup());
        catg.getId().setOptGroupType(item.getOptGroupType());
        catg.getId().setOptGroupCatg(item.getOptGroupCatg());
        catg.getId().setIsCmpstUse(item.getIsCmpstUse());
        catg.getId().setMaskLayer(item.getMaskLayer());
        catg.getId().setStatus(item.getStatus());

        // Mapping Audit fields
        catg.setCreateDt(item.getCreateDt());
        catg.setCreateUser(item.getCreateUser());
        catg.setUpdateDt(new Date());
        catg.setUpdateUser("PQO-PDMEtl");

        log.info("process to: {}", catg);
        return catg;
    }
}