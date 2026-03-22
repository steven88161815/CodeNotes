package com.tsmc.pqo.etl.cis.batch;

import java.util.Date;

import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import com.tsmc.pqo.etl.cis.model.jpa.TiProcOpt;
import com.tsmc.pqo.etl.cis.model.to.TiProcOptTo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TiProcOptProcessor implements ItemProcessor<TiProcOptTo, TiProcOpt> 
{

    @Override
    public TiProcOpt process(TiProcOptTo item) 
    {
        TiProcOpt opt = new TiProcOpt();
        
        opt.setProcOptSeq(item.getProcOptSeq());
        opt.setIsEng(item.getIsEng());
        opt.setMicrCode(item.getMicrCode());
        opt.setProcGroupMaskCnt(item.getProcGroupMaskCnt());
        opt.setProcGroupName(item.getProcGroupName());
        opt.setProcGroupTypeDesc(item.getProcGroupTypeDesc());
        opt.setProcGroupType(item.getProcGroupType());
        opt.setRemark(item.getRemark());
        opt.setStatus(item.getStatus());
        opt.setCreateDt(item.getCreateDt());
        opt.setCreateUser(item.getCreateUser());

        // Audit fields
        opt.setUpdateDt(new Date());
        opt.setUpdateUser("PQO-PDMEtl");

        log.info("process to: {}", item);
        return opt;
    }
}