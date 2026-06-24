const crypto = require("crypto");
const { getSupabase } = require("./_lib/supabase");
const { isAuthenticated } = require("./_lib/auth");

const EXT_BY_MIME = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }

  const { image } = req.body || {};
  if (!image || typeof image !== "string") {
    res.status(400).json({ error: "Envie uma imagem válida" });
    return;
  }

  const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    res.status(400).json({ error: "Formato de imagem inválido" });
    return;
  }

  const mime = match[1];
  const ext = EXT_BY_MIME[mime];
  if (!ext) {
    res.status(400).json({ error: "Tipo de imagem não suportado" });
    return;
  }

  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 8 * 1024 * 1024) {
    res.status(400).json({ error: "Imagem maior que 8MB" });
    return;
  }

  const fileName = `${crypto.randomUUID()}.${ext}`;
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from("site-images")
    .upload(fileName, buffer, { contentType: mime });

  if (error) {
    res.status(500).json({ error: "Não foi possível enviar a imagem" });
    return;
  }

  const { data } = supabase.storage.from("site-images").getPublicUrl(fileName);
  res.status(200).json({ url: data.publicUrl });
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
