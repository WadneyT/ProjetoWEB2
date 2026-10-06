package com.br.concessionaria;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.br.concessionaria.model.Marca;
import com.br.concessionaria.repository.MarcaRepository;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ConcessionariaApplicationTests {

    private static final Pattern CODIGO_JSON = Pattern.compile("\"codigo\"\\s*:\\s*(\\d+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MarcaRepository marcaRepository;

    @Test
    void contextLoads() {
    }

    @Test
    @Transactional
    void createsAndListsBrands() throws Exception {
        MvcResult criada = mockMvc.perform(post("/api/marcas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Marca de teste"}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").isNumber())
                .andExpect(jsonPath("$.nome").value("Marca de teste"))
                .andReturn();

        mockMvc.perform(get("/api/marcas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == 'Marca de teste')]").exists());

        long codigo = extrairCodigo(criada);
        mockMvc.perform(put("/api/marcas/{codigo}", codigo)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Marca atualizada"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Marca atualizada"));

        mockMvc.perform(delete("/api/marcas/{codigo}", codigo))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/marcas/{codigo}", codigo))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void createsAutomobilesWithAnExistingBrand() throws Exception {
        Marca marca = marcaRepository.save(new Marca(null, "Marca automóvel de teste"));
        String automovel = """
                {
                  "nome":"Corolla",
                  "modelo":"XEi",
                  "dataFabricacao":"2025-01-01",
                  "quantidade":2,
                  "precoVenda":142500.00,
                  "trioEletrico":true,
                  "marca":{"codigo":%d}
                }
                """.formatted(marca.getCodigo());

        MvcResult criado = mockMvc.perform(post("/api/automoveis")
                .contentType(MediaType.APPLICATION_JSON)
                .content(automovel))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Corolla"))
                .andExpect(jsonPath("$.modelo").value("XEi"))
                .andExpect(jsonPath("$.marca.nome").value("Marca automóvel de teste"))
                .andExpect(jsonPath("$.trioEletrico").value(true))
                .andReturn();

        mockMvc.perform(get("/api/automoveis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.nome == 'Corolla')]").exists());

        long codigo = extrairCodigo(criado);
        mockMvc.perform(put("/api/automoveis/{codigo}", codigo)
                .contentType(MediaType.APPLICATION_JSON)
                .content(automovel.replace("\"nome\":\"Corolla\"", "\"nome\":\"Corolla Cross\"")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Corolla Cross"));

        mockMvc.perform(delete("/api/automoveis/{codigo}", codigo))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/automoveis/{codigo}", codigo))
                .andExpect(status().isNotFound());
    }

    private long extrairCodigo(MvcResult resultado) throws Exception {
        Matcher matcher = CODIGO_JSON.matcher(resultado.getResponse().getContentAsString());
        if (!matcher.find()) {
            throw new AssertionError("A resposta não contém o código gerado.");
        }
        return Long.parseLong(matcher.group(1));
    }
}
