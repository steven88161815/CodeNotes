package com.tsmc.pqo.etl.cis.model.jpa;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import lombok.Data;

/**
 * The persistent class for the TI_PROC_OPT database table.
 * 
 */
@Data
@Entity
@Table(name = "TI_PROC_OPT")
@NamedQuery(name = "TiProcOpt.findAll", query = "SELECT t FROM TiProcOpt t")
public class TiProcOpt implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "PROC_OPT_SEQ")
    private Long procOptSeq;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "CREATE_DT")
    private Date createDt;

    @Column(name = "CREATE_USER")
    private String createUser;

    @Column(name = "IS_ENG")
    private String isEng;

    @Column(name = "MICR_CODE")
    private String micrCode;

    @Column(name = "PROC_GROUP_MASK_CNT")
    private BigDecimal procGroupMaskCnt;

    @Column(name = "PROC_GROUP_NAME")
    private String procGroupName;

    @Column(name = "PROC_GROUP_TYPE")
    private String procGroupType;

    @Column(name = "PROC_GROUP_TYPE_DESC")
    private String procGroupTypeDesc;

    @Column(name = "REMARK")
    private String remark;

    @Column(name = "STATUS")
    private String status;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "UPDATE_DT")
    private Date updateDt;

    @Column(name = "UPDATE_USER")
    private String updateUser;

}