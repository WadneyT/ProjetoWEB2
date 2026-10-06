package com.br.concessionaria.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.br.concessionaria.model.Automovel;
import com.br.concessionaria.service.AutomovelService;

@RestController
@RequestMapping("/api/automoveis")
@CrossOrigin(origins = "http://localhost:5173")
public class AutomovelController {

    private final AutomovelService automovelService;

    public AutomovelController(AutomovelService automovelService) {
        this.automovelService = automovelService;
    }

    @GetMapping
    public List<Automovel> listar() {
        return automovelService.listar();
    }

    @GetMapping("/{codigo}")
    public Automovel buscar(@PathVariable Long codigo) {
        return automovelService.buscarPorCodigo(codigo);
    }

    @PostMapping
    public ResponseEntity<Automovel> criar(@RequestBody Automovel automovel) {
        Automovel criado = automovelService.criar(automovel);
        return ResponseEntity.created(URI.create("/api/automoveis/" + criado.getCodigo())).body(criado);
    }

    @PutMapping("/{codigo}")
    public Automovel atualizar(@PathVariable Long codigo, @RequestBody Automovel automovel) {
        return automovelService.atualizar(codigo, automovel);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> excluir(@PathVariable Long codigo) {
        automovelService.excluir(codigo);
        return ResponseEntity.noContent().build();
    }
}
