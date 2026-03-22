package com.tsmc.pqo.etl.cis.model.jpa;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import lombok.Data;

/**
 * The primary key class for the TI_RAW_WAFER_QUES database table.
 * 
 */
@Data
@Embeddable
public class TiRawWaferQuesPK implements Serializable {
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

    @Column(name = "QUES_ID")
    private String quesId;
}