app.delete("/api/guests/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$queryRaw`
      DELETE FROM guests
      WHERE id = ${Number(id)}
    `;

    res.json({ message: "Külaline kustutatud" });
  } catch (error) {
    console.error("Delete guest error:", error);
    res.status(500).json({
      message: "Kustutamine ebaõnnestus",
    });
  }
});