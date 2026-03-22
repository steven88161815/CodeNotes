package com.tsmc.pqo.etl.cis.model.to;

import java.math.BigDecimal;
import java.util.Date;

import lombok.Data;

@Data
public class TiProcOptTo {

    private Long procOptSeq;

    private Date createDt;

    private String createUser;

    private String isEng;

    private String micrCode;

    private BigDecimal procGroupMaskCnt;

    private String procGroupName;

    private String procGroupType;

    private String procGroupTypeDesc;

    private String remark;

    private String status;

    private Date updateDt;

    private String updateUser;

}