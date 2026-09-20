import { API } from "./client";

export async function fetchIdentity() {
  return API.get("/api/umbrella/identity");
}
