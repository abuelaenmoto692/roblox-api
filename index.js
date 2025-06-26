const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;

app.get("/", (req, res) => {
  res.send("✅ API funcionando. Usa /check/NombreDeUsuario");
});

app.get("/check/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Obtener userId
    const userRes = await axios.get(`https://api.roblox.com/users/get-by-username?username=${username}`);
    const userId = userRes.data.Id;

    if (!userId) return res.status(404).send("❌ Usuario no encontrado");

    // Obtener presencia
    const presenceRes = await axios.post(
      "https://presence.roblox.com/v1/presence/users",
      { userIds: [userId] },
      {
        headers: {
          Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`,
        },
      }
    );

    const presence = presenceRes.data.userPresences[0];
    const online = presence.userPresenceType !== 0;

    res.json({
      username,
      userId,
      isOnline: online,
      location: presence.lastLocation,
      placeId: presence.placeId || null
    });

  } catch (err) {
    console.error("⚠️ Error:", err.message);
    res.status(500).send("❌ Error interno");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
