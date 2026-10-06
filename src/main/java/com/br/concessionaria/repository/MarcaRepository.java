package com.br.concessionaria.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.br.concessionaria.model.Marca;

public interface MarcaRepository extends JpaRepository<Marca, Long> {
    boolean existsByNomeIgnoreCase(String nome);
}
