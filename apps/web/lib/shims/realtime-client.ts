// apps/web/lib/shims/realtime-client.ts
// Shim for a non-existent package so the app compiles.
// Replace with a real implementation later if needed.

export default {};

export class RealtimeClient {
  constructor(_opts?: any) {}
  connect() {}
  disconnect() {}
}
