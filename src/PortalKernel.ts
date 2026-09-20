type KernelEnvelope = {
  id?: string;
  type?: string;
  payload?: Record<string, unknown>;
  identity?: string;
  governanceContext?: Record<string, unknown>;
};

type PortalKernelBindings = Record<string, unknown>;

export class PortalKernel {
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: PortalKernelBindings,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/api/kernel/message') {
      let envelope: KernelEnvelope;

      try {
        envelope = await request.json<KernelEnvelope>();
      } catch {
        return Response.json(
          { ok: false, error: { code: 'INVALID_JSON', message: 'Request body must be JSON' } },
          { status: 400 },
        );
      }

      if (!isRecord(envelope) || typeof envelope.type !== 'string' || !isRecord(envelope.payload)) {
        return Response.json(
          { ok: false, error: { code: 'INVALID_MESSAGE', message: 'Kernel envelope is invalid' } },
          { status: 400 },
        );
      }

      return Response.json({
        ok: true,
        messageId: envelope.id,
        type: envelope.type,
        identity: envelope.identity,
        route: [],
        result: { lanes: [] },
      });
    }

    return new Response('Portal-OS Kernel Online');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
