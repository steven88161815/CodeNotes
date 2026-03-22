package com.tsmc.pqo.etl.cis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsmc.pqo.etl.cis.model.jpa.TiRawWaferQues;
import com.tsmc.pqo.etl.cis.model.jpa.TiRawWaferQuesPK;

public interface TiRawWaferQuesDao extends JpaRepository<TiRawWaferQues, TiRawWaferQuesPK> {
}