import { useEffect } from "react";
import { TerrainMap } from "./terrain/TerrainMap";

// FullScreenMap renders the terrain map occupying the entire viewport.
// It ensures the map container stretches to 100vw and 100vh, removing any padding or margins.
// The component can be expanded later with Indian‑specific data filters.
export default function FullScreenMap() {
  // Prevent body scroll when the full‑screen map is active.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {/* The TerrainMap component already handles its own rendering logic.
          By giving it a container that fills the screen, the map expands to the full viewport.
          Any hover / interaction works as before. */}
      <TerrainMap className="w-full h-full" />
    </div>
  );
}
