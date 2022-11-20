import mapboxgl, { Marker } from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import booleanIntersects from "@turf/boolean-intersects";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import lineIntersect from "@turf/line-intersect";
import lineSlice from "@turf/line-slice";
import "mapbox-gl/dist/mapbox-gl.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import barris from "../../assets/json/barris.json";
import border from "../../assets/json/border.json";
import m from "../../assets/json/dark-matter-dark-grey.json";
import districtes from "../../assets/json/districtes.json";
import subway from "../../assets/json/subway.json";
import Overlay from "../../components/Overlay/Overlay";
import prisma from "../../lib/prisma";
import style from "./map.module.css";
import union from "@turf/union";
import booleanWithin from "@turf/boolean-within";
import difference from "@turf/difference";

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

  function getParsedFeatures(elements, type) {
    return {
      ...elements,
      features: elements.features.map((element) => {
        const selectedFeature = features.find((feature) => {
          return element.properties[type.toUpperCase()] === feature.feature_id && feature.type === type;
        });

        return {
          ...element,
          properties: {
            ...element.properties,
            UNLOCKED: `${selectedFeature.unlocked ?? false}`,
          },
        };
      }),
    };
  }

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

    map.current.on("style.load", () => {
      let availableArea;

      const parsedDistrictes = getParsedFeatures(districtes, "districte");

      parsedDistrictes.features.forEach((feature) => {
        if (feature.properties["UNLOCKED"] === "true") {
          if (!availableArea) {
            availableArea = feature;
          } else {
            availableArea = union(availableArea, feature, { properties: feature.properties });
          }
        }
      });

      const fogOfWar = {
        ...border,
        features: border.features.map((feature) => difference(feature, availableArea)),
      };

      map.current.addSource("border", {
        type: "geojson",
        data: fogOfWar,
      });

      map.current.addSource("districtes", {
        type: "geojson",
        data: parsedDistrictes,
      });

      map.current.addSource("barris", {
        type: "geojson",
        data: parseBarris(barris),
      });

      function parseSubways(subway) {
        const newSubwayFeatures = [];

        subway.features
          .filter(
            (elem, index, self) => self.findIndex((t) => t.properties.stroke === elem.properties.stroke) === index
          )
          .forEach((line) => {
            const isIntersecting = booleanIntersects(line, availableArea);
            if (isIntersecting) {
              if (line.geometry.type === "LineString") {
                const intersection = lineIntersect(line, availableArea);
                const [start, end] = intersection.features;
                const slice = lineSlice(start, end ?? line.geometry.coordinates[0], line);

                newSubwayFeatures.push(slice);
              }
            }
          });

        return newSubwayFeatures;
      }

      function parseBarris(barris) {
        const newFeatures = [];

        barris.features.forEach((barri) => {
          if (barri.geometry.type === "Polygon") {
            const isIntersecting = booleanWithin(barri, availableArea);

            if (isIntersecting) newFeatures.push(barri);
          }
        });

        return {
          ...barris,
          features: newFeatures,
        };
      }

      const subwayParsed = {
        ...subway,
        features: parseSubways(subway),
      };

      map.current.addSource("subway", {
        type: "geojson",
        data: subwayParsed,
      });

      map.current.addLayer({
        id: "border-fill",
        type: "fill",
        source: "border",
        layout: {},
        paint: {
          "fill-color": "rgba(0,0,0,.8)",
        },
      });

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
          "line-opacity": 1,
        },
        filter: ["==", "$type", "LineString"],
      });

      map.current.addLayer({
        id: "border-outline",
        type: "line",
        source: "border",
        layout: {},
        paint: {
          "line-color": "#2d7727",
          "line-width": 1,
        },
        filter: ["==", "$type", "Polygon"],
      });

      map.current.addLayer({
        id: "districtes-outline",
        type: "line",
        source: "districtes",
        layout: {},
        paint: {
          "line-color": "#d23e98",
          "line-width": ["match", ["get", "UNLOCKED"], "true", 1, "false", 0, 0],
        },
        filter: ["==", "$type", "Polygon"],
      });

      map.current.on("click", async function (e) {
        console.log(Object.values(e.lngLat));
      });

      (async () => {
        const markerIcon = await fetch("/svg/markerIcon.svg").then((res) => res.text());

        for (const marker of markers) {
          if (availableArea.length === 0 || !booleanPointInPolygon(point(marker.coordinates), availableArea)) continue;

          const innerIcon = await fetch(`/svg/markerIcons/${marker.type}.svg`).then((res) => res.text());
          let icon = document.createElement("svg");
          icon.innerHTML = innerIcon;
          icon = icon.firstChild;
          icon.classList.add("marker-icon");

          const markerElement = document.createElement("div");

          markerElement.className = "marker";

          markerElement.innerHTML = markerIcon;

          markerElement.firstChild.style.fill = stringToHsl(marker.type);
          markerElement.appendChild(icon);

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${marker.name}</h3>`);

          new Marker(markerElement).setLngLat(marker.coordinates).setPopup(popup).addTo(map.current);
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
