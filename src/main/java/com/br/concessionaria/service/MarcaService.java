package com.br.concessionaria.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.concessionaria.exception.ResourceConflictException;
import com.br.concessionaria.exception.InvalidRequestException;
import com.br.concessionaria.exception.ResourceNotFoundException;
import com.br.concessionaria.model.Marca;
import com.br.concessionaria.repository.AutomovelRepository;
import com.br.concessionaria.repository.MarcaRepository;

@Service
@Transactional
public class MarcaService {

    private final MarcaRepository marcaRepository;
    private final AutomovelRepository automovelRepository;

    public MarcaService(MarcaRepository marcaRepository, AutomovelRepository automovelRepository) {
        this.marcaRepository = marcaRepository;
        this.automovelRepository = automovelRepository;
    }

    @Transactional(readOnly = true)
    public List<Marca> listar() {
        return marcaRepository.findAll(Sort.by(Sort.Direction.ASC, "nome"));
    }

    @Transactional(readOnly = true)
    public Marca buscarPorCodigo(Long codigo) {
        return marcaRepository.findById(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Marca não encontrada: " + codigo));
    }

    public Marca criar(Marca marca) {
        validarNome(marca.getNome());
        if (marcaRepository.existsByNomeIgnoreCase(marca.getNome())) {
            throw new ResourceConflictException("Já existe uma marca com esse nome.");
        }
        marca.setCodigo(null);
        return marcaRepository.save(marca);
    }

    public Marca atualizar(Long codigo, Marca dados) {
        Marca marca = buscarPorCodigo(codigo);
        validarNome(dados.getNome());
        if (!marca.getNome().equalsIgnoreCase(dados.getNome())
                && marcaRepository.existsByNomeIgnoreCase(dados.getNome())) {
            throw new ResourceConflictException("Já existe uma marca com esse nome.");
        }
        marca.setNome(dados.getNome());
        return marcaRepository.save(marca);
    }

    public void excluir(Long codigo) {
        Marca marca = buscarPorCodigo(codigo);
        if (automovelRepository.existsByMarcaCodigo(codigo)) {
            throw new ResourceConflictException("Não é possível excluir uma marca que possui automóveis cadastrados.");
        }
        marcaRepository.delete(marca);
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new InvalidRequestException("O nome da marca é obrigatório.");
        }
    }
}
