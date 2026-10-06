package com.br.concessionaria.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.br.concessionaria.model.Automovel;

public interface AutomovelRepository extends JpaRepository<Automovel, Long> {
    boolean existsByMarcaCodigo(Long marcaCodigo);
}
