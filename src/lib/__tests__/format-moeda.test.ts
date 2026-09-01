import { describe, it, expect } from "vitest";
import { parseMoedaBR, paraFloat, somarCentavos, emCentavos } from "../format";

describe("parseMoedaBR", () => {
  it("aceita os formatos pt-BR e teclado numérico", () => {
    expect(parseMoedaBR("100")).toBe(100);
    expect(parseMoedaBR("100,50")).toBe(100.5);
    expect(parseMoedaBR("100.50")).toBe(100.5);
    expect(parseMoedaBR("1250,75")).toBe(1250.75);
    expect(parseMoedaBR("1250.75")).toBe(1250.75);
    expect(parseMoedaBR("1.250,75")).toBe(1250.75);
    expect(parseMoedaBR("1.250")).toBe(1250);
    expect(parseMoedaBR("1.250.000")).toBe(1250000);
    expect(parseMoedaBR("2.500,00")).toBe(2500);
    expect(parseMoedaBR("R$ 3.851,25")).toBe(3851.25);
    expect(parseMoedaBR("R$1.250,75")).toBe(1250.75);
    expect(parseMoedaBR("")).toBe(0);
    expect(parseMoedaBR("abc")).toBe(0);
  });

  it("paraFloat usa a mesma regra", () => {
    expect(paraFloat("1.250,75")).toBe(parseMoedaBR("1.250,75"));
  });
});

describe("somarCentavos", () => {
  it("soma sem perda de centavos", () => {
    expect(somarCentavos(0.1, 0.2)).toBe(0.3);
    expect(somarCentavos(2500, 100.5)).toBe(2600.5);
    expect(somarCentavos(2600.5, 1250.75)).toBe(3851.25);
    expect(somarCentavos(1.005, -0.005)).toBe(1);
    expect(emCentavos(1250.75)).toBe(125075);
  });
});
