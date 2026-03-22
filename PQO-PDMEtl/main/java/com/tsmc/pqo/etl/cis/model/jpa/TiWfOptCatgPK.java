package com.tsmc.pqo.etl.cis.model.jpa;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import lombok.Data;

/**
 * The primary key class for the TI_WF_OPT_CATG database table.
 * 
 */
@Data
@Embeddable
public class TiWfOptCatgPK implements Serializable {
    // default serial version id, required for serializable classes.
    private static final long serialVersionUID = 1L;

    @Column(name = "TF1_CD")
    private String tf1Cd;

    @Column(name = "GEOM_CD")
    private String geomCd;

    @Column(name = "WF_TL2_CD")
    private String wfTl2Cd;

    @Column(name = "WF_TL3_CD")
    private String wfTl3Cd;

    @Column(name = "WF_TL4_CD")
    private String wfTl4Cd;

    @Column(name = "MASK_CODE")
    private String maskCode;

    @Column(name = "USAG_CODE")
    private long usagCode;

    @Column(name = "OPT_GROUP")
    private String optGroup;

    @Column(name = "OPT_GROUP_TYPE")
    private String optGroupType;

    @Column(name = "OPT_GROUP_CATG")
    private String optGroupCatg;

    @Column(name = "IS_CMPST_USE")
    private String isCmpstUse;

    @Column(name = "MASK_LAYER")
    private String maskLayer;

    @Column(name = "STATUS")
    private String status;
}