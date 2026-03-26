import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { useQuery } from "@tanstack/react-query";
import type { backendInterface } from "../backend.d";
import { loadConfig } from "../config";
import { idlFactory } from "../declarations/backend.did";

export function useDirectActor() {
  const actorQuery = useQuery<backendInterface>({
    queryKey: ["direct-actor"],
    queryFn: async () => {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: config.backend_canister_id,
      });
      return actor as unknown as backendInterface;
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  return { actor: actorQuery.data ?? null };
}
