const bcrypt = require("bcryptjs");
const { signSession, setSessionCookie } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const { password } = req.body || {};
  if (!password) {
    res.status(400).json({ error: "Informe a senha" });
    return;
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    res.status(500).json({ error: "Login não configurado" });
    return;
  }

  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    res.status(401).json({ error: "Senha incorreta" });
    return;
  }

  const token = signSession();
  setSessionCookie(res, token);
  res.status(200).json({ ok: true });
};
