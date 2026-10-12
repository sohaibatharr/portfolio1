import type { CSSProperties } from "react";

const clientImageAssets = import.meta.glob<{ url: string }>(
  "../assets/clients/*.asset.json",
  { eager: true, import: "default" },
);

const clientImageByKey = Object.fromEntries(
  Object.entries(clientImageAssets).map(([path, asset]) => [
    path.match(/\/([^/]+)\.jpg\.asset\.json$/)?.[1],
    asset.url,
  ]),
);

const clients = [
  { key: "preston", name: "Preston" },
  { key: "brianna", name: "Brianna" },
  { key: "nico", name: "Nico Grigg" },
  { key: "vermax", name: "Vermax" },
  { key: "nhg", name: "NHG Benji" },
  { key: "suzie", name: "Suzie Taylor" },
  { key: "bige", name: "Bige" },
];

export function ClientCollage() {
  return (
    <div className="tp-client-collage" role="list" aria-label="Selected clients">
      {clients.map((client, index) => {
        const fallback = clientImageByKey[client.key];

        return (
          <span
            className="tp-client-avatar"
            key={client.key}
            role="listitem"
            style={{ "--collage-index": index } as CSSProperties}
          >
            <img
              src={`https://sohaiblandingpage.vercel.app/images/clients/${client.key}.jpg`}
              alt={client.name}
              width="56"
              height="56"
              onError={(event) => {
                if (fallback && event.currentTarget.getAttribute("src") !== fallback) {
                  event.currentTarget.src = fallback;
                }
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
