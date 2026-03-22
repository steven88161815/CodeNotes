package com.tsmc.pqo.etl.cis.model.to;

import java.util.Date;

import lombok.Data;

@Data
public class TiRawWaferQuesTo {

    private String tf1Cd;

    private String geomCd;

    private String wfTl2Cd;

    private String wfTl3Cd;

    private String wfTl4Cd;

    private String quesId;

    private String remark;

    private String fileName;

    private String status;

    private String valueProcOpt;

    private String createUser;

    private Date createDt;

    private String updateUser;

    private Date updateDt;

}