import { api } from "./client";

export const qrApi = {
  getMyQr: () => api.get("/users/me/qr"),
  resolveQr: (token: string) => api.post("/qr/resolve", { token }),
};
