import { FeatureSection } from "@/components/custom/features-section";
import { HeroSection } from "@/components/custom/hero-section";
import { getStrapiURL } from "@/lib/utils";
import qs from "qs";

const homePageQuery = qs.stringify({
  populate: {
    blocks: {
      on: {
        "layout.hero-section": {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
            link: {
              populate: true,
            },
          },
        },
        "layout.features-section": {
          populate: {
            feature: {
              populate: true,
            },
          },
        },
      },
    },
  },
});

const blockComponents = {
  "layout.hero-section": HeroSection,
  "layout.features-section": FeatureSection,
};

function blockRenderer(block: any) {
  const Component = blockComponents[block.__component as keyof typeof blockComponents];
  return Component ? <Component key={block.id} data={block} /> : null;
}

async function getStrapiData(path: string) {
  const baseUrl = getStrapiURL();

  const url = new URL(path, baseUrl);
  url.search = homePageQuery;

  try {
    const response = await fetch(url.href);
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

export default async function Home() {
  const strapiData = await getStrapiData("/api/home-page");
  const { blocks } = strapiData?.data || [];

  // console.dir(blocks, { depth: null });
  return <main>{blocks.map(blockRenderer)}</main>;
}
