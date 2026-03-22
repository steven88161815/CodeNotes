package com.tsmc.pqo.etl.cis.model.to;

import java.util.Date;

import lombok.Data;

@Data
public class TiWfOptCatgTo {

    private String tf1Cd;

    private String geomCd;

    private String wfTl2Cd;

    private String wfTl3Cd;

    private String wfTl4Cd;

    private String maskCode;

    private long usageCode;

    private String optGroup;

    private String optGroupType;

    private String optGroupCatg;

    private String isCmpstUse;

    private String maskLayer;

    private String status;

    private String createUser;

    private Date createDt;

    private String updateUser;

    private Date updateDt;

}