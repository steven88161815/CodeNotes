package com.tsmc.pqo.etl.cis.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tsmc.pqo.etl.cis.model.jpa.TiProcOpt;

public interface TiProcOptDao extends JpaRepository<TiProcOpt, Long> {
}