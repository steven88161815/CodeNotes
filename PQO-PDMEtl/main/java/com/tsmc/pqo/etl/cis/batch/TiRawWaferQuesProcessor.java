package com.tsmc.pqo.etl.cis.batch;

import java.util.Date;

import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import com.tsmc.pqo.etl.cis.model.jpa.TiRawWaferQues;
import com.tsmc.pqo.etl.cis.model.jpa.TiRawWaferQuesPK;
import com.tsmc.pqo.etl.cis.model.to.TiRawWaferQuesTo;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class TiRawWaferQuesProcessor implements ItemProcessor<TiRawWaferQuesTo, TiRawWaferQues> 
{

    @Override
    public TiRawWaferQues process(TiRawWaferQuesTo item) 
    {
        TiRawWaferQues ques = new TiRawWaferQues();
        TiRawWaferQuesPK id = new TiRawWaferQuesPK();
        
        ques.setId(id);
        ques.getId().setTf1Cd(item.getTf1Cd());
        ques.getId().setGeomCd(item.getGeomCd());
        ques.getId().setWfTl2Cd(item.getWfTl2Cd());
        ques.getId().setWfTl3Cd(item.getWfTl3Cd());
        ques.getId().setWfTl4Cd(item.getWfTl4Cd());
        ques.getId().setQuesId(item.getQuesId());

        ques.setCreateDt(item.getCreateDt());
        ques.setCreateUser(item.getCreateUser());
        ques.setFileName(item.getFileName());
        ques.setRemark(item.getRemark());
        ques.setStatus(item.getStatus());
        ques.setUpdateDt(new Date());
        ques.setUpdateUser("PQO-PDMEtl");

        String opt = item.getValueProcOpt();
        // replace Gen-1 to Gen1
        if (opt != null) 
        {
            opt = opt.replaceAll("-", "");
        }
        ques.setValueProcOpt(opt);

        log.info("process to: {}", item);
        return ques;
    }
}