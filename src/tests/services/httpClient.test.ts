import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import axios from "axios";
import httpClient from "../../services/httpClient";

describe("httpClient request interceptor", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getRequestInterceptor = () => {
    const interceptor = (httpClient.interceptors.request as any).handlers[0]?.fulfilled;
    if (!interceptor) {
      throw new Error("Request interceptor não encontrado");
    }
    return interceptor as (config: any) => any;
  };

  it("injeta bearer token em rotas privadas", () => {
    localStorage.setItem("mypet:access_token", "token-123");
    const requestInterceptor = getRequestInterceptor();

    const config = requestInterceptor({
      url: "/clientes/",
      headers: {}
    });

    expect(config.headers.Authorization).toBe("Bearer token-123");
  });

  it("não injeta token em rota pública", () => {
    localStorage.setItem("mypet:access_token", "token-123");
    const requestInterceptor = getRequestInterceptor();

    const config = requestInterceptor({
      url: "/auth/login/",
      headers: {}
    });

    expect(config.headers.Authorization).toBeUndefined();
  });

  const getResponseRejectedInterceptor = () => {
    const interceptor = (httpClient.interceptors.response as any).handlers[0]?.rejected;
    if (!interceptor) {
      throw new Error("Response interceptor não encontrado");
    }
    return interceptor as (error: any) => Promise<unknown>;
  };

  it("em 401 sem refresh token limpa sessão e redireciona para login", async () => {
    localStorage.setItem("mypet:access_token", "token-antigo");
    localStorage.setItem("mypet:user", JSON.stringify({ id: 1 }));

    const responseInterceptor = getResponseRejectedInterceptor();
    const error = {
      response: { status: 401 },
      config: { headers: {} }
    };

    await expect(responseInterceptor(error)).rejects.toBe(error);
    expect(localStorage.getItem("mypet:access_token")).toBeNull();
    expect(localStorage.getItem("mypet:refresh_token")).toBeNull();
    expect(localStorage.getItem("mypet:user")).toBeNull();
  });

  it("em 401 com refresh que falha limpa sessão e rejeita erro de refresh", async () => {
    localStorage.setItem("mypet:access_token", "token-antigo");
    localStorage.setItem("mypet:refresh_token", "refresh-antigo");
    localStorage.setItem("mypet:user", JSON.stringify({ id: 2 }));

    const refreshError = new Error("refresh falhou");
    vi.spyOn(axios, "post").mockRejectedValueOnce(refreshError);

    const responseInterceptor = getResponseRejectedInterceptor();
    const error = {
      response: { status: 401 },
      config: { headers: {} }
    };

    await expect(responseInterceptor(error)).rejects.toBe(refreshError);
    expect(axios.post).toHaveBeenCalledWith("http://localhost:8000/auth/refresh/", {
      refresh: "refresh-antigo"
    });
    expect(localStorage.getItem("mypet:access_token")).toBeNull();
    expect(localStorage.getItem("mypet:refresh_token")).toBeNull();
    expect(localStorage.getItem("mypet:user")).toBeNull();
  });
});
