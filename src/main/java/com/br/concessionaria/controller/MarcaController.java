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

import com.br.concessionaria.model.Marca;
import com.br.concessionaria.service.MarcaService;

@RestController
@RequestMapping("/api/marcas")
@CrossOrigin(origins = "http://localhost:5173")
public class MarcaController {

    private final MarcaService marcaService;

    public MarcaController(MarcaService marcaService) {
        this.marcaService = marcaService;
    }

    @GetMapping
    public List<Marca> listar() {
        return marcaService.listar();
    }

    @GetMapping("/{codigo}")
    public Marca buscar(@PathVariable Long codigo) {
        return marcaService.buscarPorCodigo(codigo);
    }

    @PostMapping
    public ResponseEntity<Marca> criar(@RequestBody Marca marca) {
        Marca criada = marcaService.criar(marca);
        return ResponseEntity.created(URI.create("/api/marcas/" + criada.getCodigo())).body(criada);
    }

    @PutMapping("/{codigo}")
    public Marca atualizar(@PathVariable Long codigo, @RequestBody Marca marca) {
        return marcaService.atualizar(codigo, marca);
    }

    @DeleteMapping("/{codigo}")
    public ResponseEntity<Void> excluir(@PathVariable Long codigo) {
        marcaService.excluir(codigo);
        return ResponseEntity.noContent().build();
    }
}
