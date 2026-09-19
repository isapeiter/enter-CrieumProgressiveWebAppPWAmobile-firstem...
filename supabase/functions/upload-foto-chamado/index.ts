// Backend function: upload de foto de chamado (bucket privado, via role de serviço)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "chamados-fotos";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      throw new Error("Configuração ausente no ambiente");
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Arquivo não enviado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Envie apenas imagens" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (file.size > MAX_BYTES) {
      return new Response(
        JSON.stringify({ error: "Imagem muito grande (máximo de 5 MB)" }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ext = file.name.includes(".")
      ? (file.name.split(".").pop() ?? "jpg")
      : "jpg";
    const caminho = `${crypto.randomUUID()}.${ext}`;

    const { error } = await admin.storage
      .from(BUCKET)
      .upload(caminho, file, { contentType: file.type });

    if (error) {
      console.error("upload-foto-chamado: falha ao salvar", error.message);
      return new Response(
        JSON.stringify({ error: "Falha ao salvar a foto. Tente de novo." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("upload-foto-chamado: foto salva", caminho);
    return new Response(JSON.stringify({ path: caminho }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("upload-foto-chamado: erro geral", e);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
