import React from "react";

import PromptInput from "~/components/prompt-input";
import { getQueryClient, trpc } from "~/trpc/server";

const Page = async () => {
  const presets = await getQueryClient().fetchQuery(
    trpc.dashboard.getPresets.queryOptions(),
  );

  return (
    <div>
      <PromptInput presets={presets} />
    </div>
  );
};

export default Page;
