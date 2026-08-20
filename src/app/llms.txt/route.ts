export function GET() {
  return new Response(
    `# Vibers\n\nDiscover, buy and sell vibe-coded software.\n- /market\n- /add\n- /product/{slug}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}
