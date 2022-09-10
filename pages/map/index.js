import mapboxgl, { Marker } from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "mapbox-gl/dist/mapbox-gl.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import barris from "../../assets/json/barris.json";
import districtes from "../../assets/json/districtes.json";
import border from "../../assets/json/border.json";
import m from "../../assets/json/dark-matter-dark-grey.json";
import subway from "../../assets/json/subway.json";
import Overlay from "../../components/Overlay/Overlay";
import style from "./map.module.css";
import prisma from "../../lib/prisma";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const parsedLayers = m.layers.filter(({ type }) => type !== "symbol");
const parsedMap = { ...m, layers: parsedLayers };

function stringToHsl(string) {
  let hash = 0;

  if (!string || string.length === 0) {
    return hash;
  }

  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  return "hsl(" + (hash % 360) + ",100%,65%)";
}

const Map = ({ markers, layers, features }) => {
  const router = useRouter();

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: parsedMap,
      center: { lng: 2.206759583830774, lat: 41.40461379542052 },
      zoom: 15,
      maxBounds: [
        [1.8631862160018784, 41.24508471281712],
        [2.4112397878661227, 41.54527346512148],
      ],
    });

    // const getPoints = async () => {
    //   try {
    //     const { lat, lng } = map.current.getCenter();

    //     const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord=${lat.toFixed(
    //       4
    //     )}%7C${lng.toFixed(4)}&gsradius=10000&gslimit=50&origin=*`;

    //     const response = await fetch(url);
    //     const json = await response.json();

    //     for (let geoObject of json.query.geosearch) {
    //       if (markers[geoObject.pageid]) return;
    //       const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    //         `<h3><a href="https://en.wikipedia.org/wiki/${geoObject.title}">${geoObject.title}</a></h3>`
    //       );
    //       markers[geoObject.pageid] = new mapboxgl.Marker()
    //         .setLngLat([geoObject.lon, geoObject.lat])
    //         .setPopup(popup)
    //         .addTo(map.current);
    //     }
    //   } catch (error) {
    //     console.error(error);
    //     alert("There was an error.");
    //   }
    // };
    // getPoints();

    // map.current.on("moveend", () => {
    //   getPoints();
    // });

    map.current.on("style.load", () => {
      map.current.addSource("barris", {
        type: "geojson",
        data: barris,
      });

      const districtesParsed = {
        ...districtes,
        features: districtes.features.map((districte) => {
          const selectedFeature = features.find((feature) => {
            return districte.properties["DISTRICTE"] === feature.feature_id && feature.type === "districte";
          });

          return {
            ...districte,
            properties: {
              ...districte.properties,
              UNLOCKED: `${selectedFeature?.unlocked ?? false}`,
            },
          };
        }),
      };

      map.current.addSource("districtes", {
        type: "geojson",
        data: districtesParsed,
      });

      const subwayParsed = {
        ...subway,
        features: subway.features.map((line) => {
          const selectedFeature = features.find((feature) => {
            return line.properties["osm_id"] === feature.feature_id && feature.type === "subway";
          });

          return {
            ...line,
            properties: {
              ...line.properties,
              UNLOCKED: `${selectedFeature?.unlocked ?? false}`,
            },
          };
        }),
      };

      map.current.addSource("subway", {
        type: "geojson",
        data: subwayParsed,
      });

      map.current.addSource("border", {
        type: "geojson",
        data: border,
      });

      map.current.addLayer({
        id: "districtes-fill",
        type: "fill",
        source: "districtes",
        layout: {},
        paint: {
          "fill-color": [
            "match",
            ["get", "UNLOCKED"],
            "true",
            "rgba(0,0,0,0)",
            "false",
            "rgba(0,0,0,.8)",
            "rgba(0,0,0,.8)",
          ],
        },
      });

      if (layers.find(({ name }) => name === "barris")?.unlocked) {
        map.current.addLayer({
          id: "barris-outline",
          type: "line",
          source: "barris",
          layout: {},
          paint: {
            "line-color": "#d23e98",
            "line-width": 1,
          },
          filter: ["==", "$type", "Polygon"],
        });
      }

      if (layers.find(({ name }) => name === "districtes")?.unlocked) {
        map.current.addLayer({
          id: "districtes-outline",
          type: "line",
          source: "districtes",
          layout: {},
          paint: {
            "line-color": "#d23e98",
            "line-width": 1,
          },
          filter: ["==", "$type", "Polygon"],
        });
      }

      if (layers.find(({ name }) => name === "subway")?.unlocked) {
        map.current.addLayer({
          id: "subway-outline",
          type: "line",
          source: "subway",
          layout: {},
          paint: {
            "line-color": {
              type: "identity",
              property: "stroke",
            },
            "line-width": 1,
            "line-opacity": ["match", ["get", "UNLOCKED"], "true", 1, "false", 0, 0],
          },
          filter: ["==", "$type", "LineString"],
        });
      }

      map.current.addLayer({
        id: "border-outline",
        type: "line",
        source: "border",
        layout: {},
        paint: {
          "line-color": "#2d7727",
          "line-width": 4,
        },
        filter: ["==", "$type", "Polygon"],
      });

      map.current.on("click", async function (e) {
        console.log(Object.values(e.lngLat));
      });

      (async () => {
        const markerIcon = await fetch("/svg/markerIcon.svg").then((res) => res.text());

        for (const marker of markers) {
          if (!marker.unlocked) return;

          const innerIcon = await fetch(`/svg/markerIcons/${marker.type}.svg`).then((res) => res.text());

          const markerElement = document.createElement("div");
          const icon = document.createElement("svg");

          markerElement.className = "marker";

          icon.innerHTML = innerIcon;
          markerElement.innerHTML = markerIcon;

          markerElement.firstChild.style.fill = stringToHsl(marker.type);
          icon.querySelector("path").setAttribute("transform", "translate(230, 160)");

          markerElement.firstChild.appendChild(icon.querySelector("path"));

          new Marker(markerElement).setLngLat(marker.coordinates).addTo(map.current);
        }
      })();
    });
  }, []);

  return (
    <Overlay>
      <Head>
        <title>{router.pathname}</title>
      </Head>
      <div ref={mapContainer} className={style.map} />
    </Overlay>
  );
};

export const getStaticProps = async () => {
  const markers = await prisma.markers.findMany({});
  const layers = await prisma.layers.findMany({});
  const features = await prisma.features.findMany({});

  return {
    props: {
      markers: JSON.parse(JSON.stringify(markers)),
      layers: JSON.parse(JSON.stringify(layers)),
      features: JSON.parse(JSON.stringify(features)),
    },
    revalidate: 10,
  };
};

export default Map;
