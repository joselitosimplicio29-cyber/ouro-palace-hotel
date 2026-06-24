const { isAuthenticated } = require("./_lib/auth");

module.exports = async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "Não autorizado" });
    return;
  }
  res.status(200).json({ ok: true });
};
