import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const pin = JSON.parse(await readFile(new URL("./story-video-artifact.json", import.meta.url), "utf8"));
const get = async (url, method = "GET") => {
  const response = await fetch(url, { method, signal: AbortSignal.timeout(180_000), headers: { "User-Agent": "night-desk-artifact-check" } });
  if (!response.ok) throw new Error(`Artifact check failed (${response.status}): ${url}`);
  return response;
};
// A full streamed digest checks actual bytes, not a HEAD response or CDN receipt.
const response = await get(pin.mirror);
const hash = createHash("sha256");
for await (const chunk of response.body) hash.update(chunk);
if (hash.digest("hex") !== pin.sha256) throw new Error("Mirror checksum mismatch; never update the pin automatically.");
console.log("Pinned mirror is available and its full SHA256 matches.");
try { await get(pin.upstream, "HEAD"); }
catch (error) { console.warn(`Upstream unavailable; verified mirror retained: ${error.message}`); }
const release = await (await get("https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/latest")).json();
const names = (release.assets ?? []).map(asset => asset.name);
const available = names.flatMap(name => [...name.matchAll(/n(\d+)\.(\d+)\.(\d+).*linux64-lgpl/g)].map(match => match.slice(1, 4).map(Number)));
if (!available.length) throw new Error("Unable to inspect upstream versions; manual review required.");
const current = pin.version.match(/^n(\d+)\.(\d+)\.(\d+)/).slice(1).map(Number);
const newer = available.some(version => version.some((part, i) => part > current[i] && version.slice(0, i).every((p, j) => p === current[j])));
if (newer) throw new Error(`A newer upstream LGPL release is available (${release.html_url}); review security changes and approve a new checksum. No automatic upgrade performed.`);
const branchBuilds = names.filter(name => name.startsWith(`ffmpeg-n${current[0]}.${current[1]}.`) && name.endsWith(`-linux64-lgpl-${current[0]}.${current[1]}.tar.xz`));
if (branchBuilds.some(name => name !== `${pin.name}.tar.xz`)) throw new Error("The pinned upstream branch has a different build revision. Review upstream security fixes before retaining or replacing the pin.");
console.log(`Upstream version check complete: ${pin.version}. This is update detection, not a vulnerability audit.`);
