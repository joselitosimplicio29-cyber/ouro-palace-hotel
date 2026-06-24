const { getSupabase } = require("./_lib/supabase");
const { isAuthenticated } = require("./_lib/auth");

module.exports = async (req, res) => {
  const supabase = getSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .single();

    if (error) {
      res.status(500).json({ error: "Não foi possível carregar o conteúdo" });
      return;
    }

    res.status(200).json(data.data);
    return;
  }

  if (req.method === "PUT") {
    if (!isAuthenticated(req)) {
      res.status(401).json({ error: "Não autorizado" });
      return;
    }

    const newContent = req.body;
    if (!newContent || typeof newContent !== "object") {
      res.status(400).json({ error: "Conteúdo inválido" });
      return;
    }

    const { error } = await supabase
      .from("site_content")
      .update({ data: newContent, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (error) {
      res.status(500).json({ error: "Não foi possível salvar o conteúdo" });
      return;
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.status(405).json({ error: "Método não permitido" });
};
