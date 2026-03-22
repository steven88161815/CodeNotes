package com.tsmc.pqo.etl.cis.model.jpa;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import lombok.Data;

/**
 * The persistent class for the TI_RAW_WAFER_QUES database table.
 * 
 */
@Data
@Entity
@Table(name = "TI_RAW_WAFER_QUES")
@NamedQuery(name = "TiRawWaferQues.findAll", query = "SELECT t FROM TiRawWaferQues t")
public class TiRawWaferQues implements Serializable {
    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private TiRawWaferQuesPK id;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "CREATE_DT")
    private Date createDt;

    @Column(name = "CREATE_USER")
    private String createUser;

    @Column(name = "FILE_NAME")
    private String fileName;

    @Column(name = "REMARK")
    private String remark;

    @Column(name = "STATUS")
    private String status;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "UPDATE_DT")
    private Date updateDt;

    @Column(name = "UPDATE_USER")
    private String updateUser;

    @Column(name = "VALUE_PROC_OPT")
    private String valueProcOpt;

}