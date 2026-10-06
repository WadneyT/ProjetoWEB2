package com.br.concessionaria.service;

import java.util.List;

import com.br.concessionaria.exception.InvalidRequestException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.concessionaria.exception.ResourceNotFoundException;
import com.br.concessionaria.model.Automovel;
import com.br.concessionaria.model.Marca;
import com.br.concessionaria.repository.AutomovelRepository;

@Service
@Transactional
public class AutomovelService {

    private final AutomovelRepository automovelRepository;
    private final MarcaService marcaService;

    public AutomovelService(AutomovelRepository automovelRepository, MarcaService marcaService) {
        this.automovelRepository = automovelRepository;
        this.marcaService = marcaService;
    }

    @Transactional(readOnly = true)
    public List<Automovel> listar() {
        return automovelRepository.findAll(Sort.by(Sort.Direction.DESC, "codigo"));
    }

    @Transactional(readOnly = true)
    public Automovel buscarPorCodigo(Long codigo) {
        return automovelRepository.findById(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Automóvel não encontrado: " + codigo));
    }

    public Automovel criar(Automovel automovel) {
        validarDados(automovel);
        automovel.setCodigo(null);
        automovel.setMarca(buscarMarca(automovel));
        return automovelRepository.save(automovel);
    }

    public Automovel atualizar(Long codigo, Automovel dados) {
        Automovel automovel = buscarPorCodigo(codigo);
        validarDados(dados);
        automovel.setNome(dados.getNome());
        automovel.setModelo(dados.getModelo());
        automovel.setDataFabricacao(dados.getDataFabricacao());
        automovel.setQuantidade(dados.getQuantidade());
        automovel.setPrecoVenda(dados.getPrecoVenda());
        automovel.setTrioEletrico(dados.isTrioEletrico());
        automovel.setMarca(buscarMarca(dados));
        return automovelRepository.save(automovel);
    }

    public void excluir(Long codigo) {
        automovelRepository.delete(buscarPorCodigo(codigo));
    }

    private Marca buscarMarca(Automovel automovel) {
        if (automovel.getMarca() == null || automovel.getMarca().getCodigo() == null) {
            throw new ResourceNotFoundException("Informe uma marca válida para o automóvel.");
        }
        return marcaService.buscarPorCodigo(automovel.getMarca().getCodigo());
    }

    private void validarDados(Automovel automovel) {
        if (automovel.getNome() == null || automovel.getNome().isBlank()
                || automovel.getModelo() == null || automovel.getModelo().isBlank()) {
            throw new InvalidRequestException("O nome e o modelo do automóvel são obrigatórios.");
        }
        if (automovel.getDataFabricacao() == null) {
            throw new InvalidRequestException("A data de fabricação é obrigatória.");
        }
        if (automovel.getQuantidade() < 0) {
            throw new InvalidRequestException("A quantidade em estoque não pode ser negativa.");
        }
        if (automovel.getPrecoVenda() == null || automovel.getPrecoVenda().signum() <= 0) {
            throw new InvalidRequestException("O preço de venda deve ser maior que zero.");
        }
    }
}
