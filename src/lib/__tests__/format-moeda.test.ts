import { describe, it, expect } from "vitest";
import { parseMoedaBR } from "../format";
describe("parseMoedaBR", () => {
  it("pt-BR", () => {
    expect(parseMoedaBR("100,50")).toBe(100.5);
    expect(parseMoedaBR("1.250,75")).toBe(1250.75);
    expect(parseMoedaBR("2500")).toBe(2500);
    expect(parseMoedaBR("2.500,00")).toBe(2500);
    expect(parseMoedaBR("100.50")).toBe(100.5);
    expect(parseMoedaBR("1.250")).toBe(1250);
    expect(parseMoedaBR("R$ 3.851,25")).toBe(3851.25);
    expect(parseMoedaBR("")).toBe(0);
  });
});
