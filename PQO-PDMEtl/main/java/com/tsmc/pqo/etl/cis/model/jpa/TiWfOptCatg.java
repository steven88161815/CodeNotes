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
 * The persistent class for the TI_WF_OPT_CATG database table.
 * 
 */
@Data
@Entity
@Table(name = "TI_WF_OPT_CATG")
@NamedQuery(name = "TiWfOptCatg.findAll", query = "SELECT t FROM TiWfOptCatg t")
public class TiWfOptCatg implements Serializable {
    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private TiWfOptCatgPK id;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "CREATE_DT")
    private Date createDt;

    @Column(name = "CREATE_USER")
    private String createUser;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "UPDATE_DT")
    private Date updateDt;

    @Column(name = "UPDATE_USER")
    private String updateUser;

}