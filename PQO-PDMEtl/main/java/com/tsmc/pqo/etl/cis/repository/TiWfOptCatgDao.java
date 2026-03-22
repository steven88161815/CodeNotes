package com.tsmc.pqo.etl.cis.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tsmc.pqo.etl.cis.model.jpa.TiWfOptCatg;
import com.tsmc.pqo.etl.cis.model.jpa.TiWfOptCatgPK;

@Repository
public interface TiWfOptCatgDao extends JpaRepository<TiWfOptCatg, TiWfOptCatgPK> {
}