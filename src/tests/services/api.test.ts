import { describe, expect, it } from "vitest";
import { mapGroupsToRole } from "../../services/api";

describe("mapGroupsToRole", () => {
  it("retorna ADMINISTRADOR quando grupo administrador existe", () => {
    expect(mapGroupsToRole(["CLIENTE", "ADMINISTRADOR"])).toBe("ADMINISTRADOR");
  });

  it("retorna FUNCIONARIO quando não é admin", () => {
    expect(mapGroupsToRole(["FUNCIONARIO"])).toBe("FUNCIONARIO");
  });

  it("retorna SUPER_USUARIO quando aplicável", () => {
    expect(mapGroupsToRole(["SUPER_USUARIO"])).toBe("SUPER_USUARIO");
  });

  it("retorna CLIENTE quando nenhum grupo reconhecido existe", () => {
    expect(mapGroupsToRole(["OUTRO"])).toBe("CLIENTE");
  });
});
